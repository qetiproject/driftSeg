import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateSegmentDto, SegmentRuleKind, UpdateSegmentDto } from '../dto';
import {
  SegmentDeltaDocument,
  SegmentDocument,
  SegmentMembershipDocument,
  SegmentTypeEnum,
} from '../models';
import {
  CustomerActivityRepository,
  SegmentDeltaRepository,
  SegmentRepository,
} from '../repositories';
import { SegmentOrchestrationService } from './segment-orchestration.service';
import { SegmentQueryService } from './segment-query.service';
import { SegmentRuntimeService } from './segment-runtime.service';
import { SegmentSignalService } from './segment-signal.service';
import { SegmentValidationService } from './segment-validation.service';

@Injectable()
export class SegmentService {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentValidationService: SegmentValidationService,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly customerActivityRepository: CustomerActivityRepository,
    private readonly segmentQueryService: SegmentQueryService,
    private readonly segmentOrchestrationService: SegmentOrchestrationService,
    private readonly segmentRuntimeService: SegmentRuntimeService,
    private readonly segmentSignalService: SegmentSignalService,
  ) {}

  async createSegment(payload: CreateSegmentDto): Promise<SegmentDocument> {
    const dependencyIds = payload.dependsOnSegmentIds ?? [];

    await this.segmentValidationService.assertUniqueSegmentName(payload.name);
    await this.segmentValidationService.assertDependencySegmentsExist(
      dependencyIds,
    );
    await this.segmentValidationService.assertRuleReferencedSegmentsExist(
      payload.rules,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.segmentValidationService.assertCompositionDependenciesMatch(
      payload.rules,
      dependencyIds,
    );
    this.segmentValidationService.assertRuleCompatibleWithType(
      payload.type,
      payload.rules.kind,
    );

    return await this.segmentRepository.create({
      ...payload,
      dependsOnSegmentIds: (payload.dependsOnSegmentIds ?? []).map(
        (id) => new Types.ObjectId(id),
      ),
      isActive: payload.isActive ?? true,
      lastComputedAt: undefined,
    });
  }

  async updateSegment(
    segmentId: string,
    payload: UpdateSegmentDto,
  ): Promise<SegmentDocument> {
    const current = await this.segmentRepository.findOne({ _id: segmentId });
    const currentRules = current.rules as CreateSegmentDto['rules'];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const effectiveRules = payload.rules ?? currentRules;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const effectiveType = payload.type ?? current.type;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const effectiveDependencyIds =
      payload.dependsOnSegmentIds ??
      (current.dependsOnSegmentIds ?? []).map((id) => id.toString());

    if (payload.name && payload.name !== current.name) {
      await this.segmentValidationService.assertUniqueSegmentName(payload.name);
    }

    await this.segmentValidationService.assertDependencySegmentsExist(
      effectiveDependencyIds,
    );
    await this.segmentValidationService.assertRuleReferencedSegmentsExist(
      effectiveRules,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.segmentValidationService.assertCompositionDependenciesMatch(
      effectiveRules,
      effectiveDependencyIds,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const effectiveKind: SegmentRuleKind | undefined = effectiveRules?.kind;
    this.segmentValidationService.assertRuleCompatibleWithType(
      effectiveType,
      effectiveKind,
    );

    return await this.segmentRepository.findOneAndUpdate(
      { _id: segmentId },
      {
        $set: {
          ...payload,
          ...(payload.dependsOnSegmentIds
            ? {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                dependsOnSegmentIds: payload.dependsOnSegmentIds.map(
                  (id) => new Types.ObjectId(id),
                ),
              }
            : {}),
        },
      },
    );
  }

  async removeSegment(segmentId: string): Promise<SegmentDocument | null> {
    return await this.segmentRepository.findOneAndDelete({ _id: segmentId });
  }

  async manualRefreshSegment(
    segmentId: string,
  ): Promise<{ segment: SegmentDocument; delta: SegmentDeltaDocument }> {
    const now = this.segmentRuntimeService.now();
    await this.segmentOrchestrationService.recomputeOne(
      segmentId,
      'manual_refresh',
      now,
      undefined,
      true,
    );
    const segment = await this.segmentRepository.findOne({ _id: segmentId });
    const allDeltas = await this.segmentDeltaRepository.find({
      segmentId: new Types.ObjectId(segmentId),
    });
    const delta =
      allDeltas[allDeltas.length - 1] ??
      (await this.segmentDeltaRepository.create({
        segmentId: new Types.ObjectId(segmentId),
        addedCustomerIds: [],
        removedCustomerIds: [],
        reason: 'manual_refresh',
        triggeredBySegmentId: undefined,
      }));
    return { segment, delta };
  }

  async recomputeAll(reason: 'time_advanced' | 'profile_updated' | 'bulk_import') {
    const now = this.segmentRuntimeService.now();
    return await this.segmentOrchestrationService.recomputeAllDynamicSegments(
      reason,
      now,
    );
  }

  async addTransaction(payload: {
    customerId: string;
    amount: number;
    at?: string;
  }) {
    const eventTime = payload.at ? new Date(payload.at) : this.segmentRuntimeService.now();
    await this.customerActivityRepository.appendTransaction(
      payload.customerId,
      payload.amount,
      eventTime,
    );
    const deltas = await this.segmentOrchestrationService.recomputeAllDynamicSegments(
      'transaction_added',
      this.segmentRuntimeService.now(),
    );
    return { appliedAt: eventTime.toISOString(), deltas };
  }

  async updateProfile(payload: {
    customerId: string;
    patch: Record<string, unknown>;
  }) {
    await this.customerActivityRepository.mergeProfile(payload.customerId, payload.patch);
    const deltas = await this.segmentOrchestrationService.recomputeAllDynamicSegments(
      'profile_updated',
      this.segmentRuntimeService.now(),
    );
    return { deltas };
  }

  async advanceTime(days: number) {
    const now = this.segmentRuntimeService.advanceByDays(days);
    const deltas = await this.segmentOrchestrationService.recomputeAllDynamicSegments(
      'time_advanced',
      now,
    );
    return { now: now.toISOString(), deltas };
  }

  async importTransactions(
    payload: Array<{ customerId: string; amount: number; at?: string }>,
    chunkSize = 1000,
  ) {
    const normalized = payload.map((x) => ({
      customerId: x.customerId,
      amount: x.amount,
      at: x.at ? new Date(x.at) : this.segmentRuntimeService.now(),
    }));
    const processed = await this.customerActivityRepository.upsertTransactionsInChunks(
      normalized,
      chunkSize,
    );
    const deltas = await this.segmentOrchestrationService.recomputeAllDynamicSegments(
      'bulk_import',
      this.segmentRuntimeService.now(),
    );
    return { processed, chunkSize, deltas };
  }

  pullUiSignals() {
    return this.segmentSignalService.pullUiSignals();
  }

  pullBackgroundSignals() {
    return this.segmentSignalService.pullBackgroundSignals();
  }

  async bootstrapDemoSegments() {
    const specs: CreateSegmentDto[] = [
      {
        name: 'Active Buyers',
        type: SegmentTypeEnum.DYNAMIC,
        rules: { kind: SegmentRuleKind.ACTIVE_BUYERS, days: 30 },
        dependsOnSegmentIds: [],
        isActive: true,
      },
      {
        name: 'VIP Customers',
        type: SegmentTypeEnum.DYNAMIC,
        rules: { kind: SegmentRuleKind.VIP, days: 60, minSpend: 5000 },
        dependsOnSegmentIds: [],
        isActive: true,
      },
      {
        name: 'Risk Group',
        type: SegmentTypeEnum.DYNAMIC,
        rules: { kind: SegmentRuleKind.RISK, inactiveDays: 90 },
        dependsOnSegmentIds: [],
        isActive: true,
      },
      {
        name: 'March Campaign Audience',
        type: SegmentTypeEnum.STATIC,
        rules: { kind: SegmentRuleKind.MANUAL_SNAPSHOT },
        dependsOnSegmentIds: [],
        isActive: true,
      },
    ];

    const created: SegmentDocument[] = [];
    for (const spec of specs) {
      const existing = await this.segmentRepository.findByName(spec.name);
      if (existing) {
        created.push(existing);
        continue;
      }
      created.push(await this.createSegment(spec));
    }

    const vip = created.find((x) => x.name === 'VIP Customers');
    const risk = created.find((x) => x.name === 'Risk Group');
    const vipRiskExisting = await this.segmentRepository.findByName('VIP ∩ Risk');
    if (!vipRiskExisting && vip && risk) {
      created.push(
        await this.createSegment({
          name: 'VIP ∩ Risk',
          type: SegmentTypeEnum.DYNAMIC,
          rules: {
            kind: SegmentRuleKind.SEGMENT_COMPOSITION,
            segmentIds: [vip._id.toString(), risk._id.toString()],
            operator: 'intersection',
          },
          dependsOnSegmentIds: [vip._id.toString(), risk._id.toString()],
          isActive: true,
        }),
      );
    }

    return created;
  }

  async listSegments(): Promise<SegmentDocument[]> {
    return await this.segmentQueryService.listSegments();
  }

  async listSegmentMemberships(
    segmentId: string,
  ): Promise<SegmentMembershipDocument[]> {
    return await this.segmentQueryService.listSegmentMemberships(segmentId);
  }

  async listSegmentDeltas(segmentId: string): Promise<SegmentDeltaDocument[]> {
    return await this.segmentQueryService.listSegmentDeltas(segmentId);
  }
}
