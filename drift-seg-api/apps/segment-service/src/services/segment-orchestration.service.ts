import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  SegmentCompositionOperator,
  SegmentRuleKind,
  type SegmentRuleInput,
} from '../dto';
import { SegmentDeltaDocument, SegmentTypeEnum, type SegmentDocument } from '../models';
import {
  CustomerActivityRepository,
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from '../repositories';
import {
  SegmentDeltaSignal,
  SegmentSignalService,
} from './segment-signal.service';

type RecomputeReason =
  | 'transaction_added'
  | 'profile_updated'
  | 'time_advanced'
  | 'manual_refresh'
  | 'dependency_delta'
  | 'bulk_import';

@Injectable()
export class SegmentOrchestrationService {
  private readonly logger = new Logger(SegmentOrchestrationService.name);

  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly customerActivityRepository: CustomerActivityRepository,
    private readonly segmentSignalService: SegmentSignalService,
  ) {}

  async recomputeAllDynamicSegments(
    reason: RecomputeReason,
    asOf: Date,
  ): Promise<SegmentDeltaSignal[]> {
    const segments = await this.segmentRepository.find({
      type: SegmentTypeEnum.DYNAMIC,
      isActive: true,
    });
    const sortedSegments = [...segments].sort((a, b) =>
      a.dependsOnSegmentIds.length - b.dependsOnSegmentIds.length,
    );
    const signals: SegmentDeltaSignal[] = [];
    for (const segment of sortedSegments) {
      const signal = await this.recomputeOne(segment._id.toString(), reason, asOf);
      if (signal) {
        signals.push(signal);
      }
    }
    return signals;
  }

  async recomputeOne(
    segmentId: string,
    reason: RecomputeReason,
    asOf: Date,
    triggerSegmentId?: string,
    allowStatic = false,
  ): Promise<SegmentDeltaSignal | null> {
    const segment = await this.segmentRepository.findOne({ _id: segmentId });
    if (
      !allowStatic &&
      segment.type === SegmentTypeEnum.STATIC &&
      reason !== 'manual_refresh'
    ) {
      return null;
    }

    const currentCustomerIds =
      await this.segmentMembershipRepository.listCustomerIdsForSegment(segmentId);
    const targetCustomerIds = await this.evaluateSegment(segment, asOf);
    const currentSet = new Set(currentCustomerIds);
    const targetSet = new Set(targetCustomerIds);

    const added = targetCustomerIds.filter((id) => !currentSet.has(id));
    const removed = currentCustomerIds.filter((id) => !targetSet.has(id));

    await this.segmentMembershipRepository.addMemberships(segmentId, added);
    await this.segmentMembershipRepository.removeMemberships(segmentId, removed);
    await this.segmentRepository.findOneAndUpdate(
      { _id: segmentId },
      { $set: { lastComputedAt: asOf } },
    );

    if (added.length === 0 && removed.length === 0) {
      return null;
    }

    await this.createDelta(segmentId, added, removed, reason, triggerSegmentId);
    const signal: SegmentDeltaSignal = {
      segmentId,
      segmentName: segment.name,
      reason,
      evaluatedAt: asOf.toISOString(),
      addedCustomerIds: added,
      removedCustomerIds: removed,
    };
    this.segmentSignalService.publish(signal);
    await this.recomputeDependents(segmentId, asOf);
    return signal;
  }

  private async recomputeDependents(
    sourceSegmentId: string,
    asOf: Date,
  ): Promise<void> {
    const dependents = await this.segmentRepository.find({
      dependsOnSegmentIds: new Types.ObjectId(sourceSegmentId),
      type: SegmentTypeEnum.DYNAMIC,
      isActive: true,
    });
    for (const dependent of dependents) {
      await this.recomputeOne(
        dependent._id.toString(),
        'dependency_delta',
        asOf,
        sourceSegmentId,
      );
    }
  }

  private async createDelta(
    segmentId: string,
    addedCustomerIds: string[],
    removedCustomerIds: string[],
    reason: string,
    triggerSegmentId?: string,
  ): Promise<SegmentDeltaDocument> {
    return await this.segmentDeltaRepository.create({
      segmentId: new Types.ObjectId(segmentId),
      addedCustomerIds: addedCustomerIds.map((id) => new Types.ObjectId(id)),
      removedCustomerIds: removedCustomerIds.map((id) => new Types.ObjectId(id)),
      reason,
      triggeredBySegmentId: triggerSegmentId
        ? new Types.ObjectId(triggerSegmentId)
        : undefined,
    });
  }

  private async evaluateSegment(
    segment: SegmentDocument,
    asOf: Date,
  ): Promise<string[]> {
    const rules = segment.rules as SegmentRuleInput;
    if (rules.kind === SegmentRuleKind.ACTIVE_BUYERS) {
      return await this.evaluateActiveBuyers(asOf, Number(rules.days));
    }
    if (rules.kind === SegmentRuleKind.VIP) {
      return await this.evaluateVip(asOf, Number(rules.days), Number(rules.minSpend));
    }
    if (rules.kind === SegmentRuleKind.RISK) {
      return await this.evaluateRisk(asOf, Number(rules.inactiveDays));
    }
    if (rules.kind === SegmentRuleKind.SEGMENT_COMPOSITION) {
      return await this.evaluateComposition(
        (rules.segmentIds as string[]) ?? [],
        String(rules.operator) as SegmentCompositionOperator,
      );
    }
    this.logger.warn(`Unsupported rule kind=${String(rules.kind)} for evaluation`);
    return [];
  }

  private async evaluateActiveBuyers(asOf: Date, days: number): Promise<string[]> {
    const from = new Date(asOf.getTime() - days * 24 * 60 * 60 * 1000);
    const all = await this.customerActivityRepository.find({});
    return all
      .filter((customer) =>
        customer.transactions.some((t) => new Date(t.at) >= from && new Date(t.at) <= asOf),
      )
      .map((customer) => customer.customerId.toString());
  }

  private async evaluateVip(
    asOf: Date,
    days: number,
    minSpend: number,
  ): Promise<string[]> {
    const from = new Date(asOf.getTime() - days * 24 * 60 * 60 * 1000);
    const all = await this.customerActivityRepository.find({});
    return all
      .filter((customer) => {
        const total = customer.transactions.reduce((acc, tx) => {
          const date = new Date(tx.at);
          return date >= from && date <= asOf ? acc + tx.amount : acc;
        }, 0);
        return total >= minSpend;
      })
      .map((customer) => customer.customerId.toString());
  }

  private async evaluateRisk(asOf: Date, inactiveDays: number): Promise<string[]> {
    const from = new Date(asOf.getTime() - inactiveDays * 24 * 60 * 60 * 1000);
    const all = await this.customerActivityRepository.find({});
    return all
      .filter((customer) => {
        const hasRecent = customer.transactions.some((tx) => {
          const date = new Date(tx.at);
          return date >= from && date <= asOf;
        });
        if (hasRecent) {
          return false;
        }
        return customer.transactions.some((tx) => new Date(tx.at) < from);
      })
      .map((customer) => customer.customerId.toString());
  }

  private async evaluateComposition(
    segmentIds: string[],
    operator: SegmentCompositionOperator,
  ): Promise<string[]> {
    if (segmentIds.length === 0) {
      return [];
    }
    const memberships = await Promise.all(
      segmentIds.map(async (id) => ({
        segmentId: id,
        customerIds:
          await this.segmentMembershipRepository.listCustomerIdsForSegment(id),
      })),
    );
    if (operator === SegmentCompositionOperator.UNION) {
      return [...new Set(memberships.flatMap((x) => x.customerIds))];
    }

    const [first, ...rest] = memberships;
    const intersection = new Set(first?.customerIds ?? []);
    for (const membership of rest) {
      const next = new Set(membership.customerIds);
      for (const customerId of [...intersection]) {
        if (!next.has(customerId)) {
          intersection.delete(customerId);
        }
      }
    }
    return [...intersection];
  }
}
