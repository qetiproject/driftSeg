import {
  TRANSACTION_CREATED_EVENT,
  type TransactionCreatedEvent,
} from '@app/common/dto';
import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { SegmentRuleInput, SegmentRuleKind, SegmentTypeEnum } from '../dto';
import {
  CustomerActivityRepository,
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from '../repositories';
import { SegmentRuleEvaluatorService } from './segment-rule-evaluator.service';

@Injectable()
export class SegmentMembershipService {
  private readonly logger = new Logger(SegmentMembershipService.name);

  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly customerActivityRepository: CustomerActivityRepository,
    private readonly segmentRuleEvaluatorService: SegmentRuleEvaluatorService,
  ) {}

  private isSegmentRuleInput(value: unknown): value is SegmentRuleInput {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const kind = (value as { kind?: unknown }).kind;
    return (
      kind === SegmentRuleKind.ACTIVE_BUYERS ||
      kind === SegmentRuleKind.VIP ||
      kind === SegmentRuleKind.RISK
    );
  }

  async processTransactionCreated(
    event: TransactionCreatedEvent,
  ): Promise<void> {
    if (event.eventType !== TRANSACTION_CREATED_EVENT) {
      return;
    }

    const customerObjectId = new Types.ObjectId(event.data.customerMongoId);
    await this.recomputeMembershipForCustomer(customerObjectId, {
      eventId: event.eventId,
      eventType: event.eventType,
    });
  }

  async recomputeAllDynamicMemberships(): Promise<void> {
    const customerIds =
      await this.customerActivityRepository.getDistinctCustomerIdsWithTransactions();

    for (const customerId of customerIds) {
      await this.recomputeMembershipForCustomer(customerId, {
        eventId: `scheduler-${new Date().toISOString()}-${customerId.toString()}`,
        eventType: 'segment.recompute.scheduler',
      });
    }
  }

  private async recomputeMembershipForCustomer(
    customerId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    const segments = await this.segmentRepository.find({
      type: SegmentTypeEnum.DYNAMIC,
    });

    for (const segment of segments) {
      if (!this.isSegmentRuleInput(segment.rules)) {
        this.logger.warn(
          `Skipping segment ${segment._id.toString()} because rules are invalid`,
        );
        continue;
      }

      const shouldBeMember =
        await this.segmentRuleEvaluatorService.shoulCustomerMemberToSegment(
          segment.rules,
          customerId,
        );
      const currentMembership =
        await this.segmentMembershipRepository.findActiveMembership(
          segment._id,
          customerId,
        );

      if (shouldBeMember && !currentMembership) {
        await this.addCustomerToSegment(segment._id, customerId, trigger);
        continue;
      }

      if (!shouldBeMember && currentMembership) {
        await this.removeCustomerFromSegment(
          currentMembership._id,
          segment._id,
          customerId,
          trigger,
        );
      }
    }
  }

  private async addCustomerToSegment(
    segmentId: Types.ObjectId,
    customerObjectId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    await this.segmentMembershipRepository.create({
      segmentId,
      customerId: customerObjectId,
      isActive: true,
    });
    await this.segmentDeltaRepository.create({
      segmentId,
      addedCustomerIds: [customerObjectId],
      removedCustomerIds: [],
      triggerEventId: trigger.eventId,
      triggerEventType: trigger.eventType,
      computedAt: new Date(),
    });
    this.logger.log(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `customer ${customerObjectId} added to segment ${segmentId.toString()}`,
    );
  }

  private async removeCustomerFromSegment(
    membershipId: Types.ObjectId,
    segmentId: Types.ObjectId,
    customerObjectId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    await this.segmentMembershipRepository.findOneAndUpdate(
      { _id: membershipId },
      { $set: { isActive: false } },
    );
    await this.segmentDeltaRepository.create({
      segmentId,
      addedCustomerIds: [],
      removedCustomerIds: [customerObjectId],
      triggerEventId: trigger.eventId,
      triggerEventType: trigger.eventType,
      computedAt: new Date(),
    });
    this.logger.log(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `customer ${customerObjectId} removed from segment ${segmentId.toString()}`,
    );
  }
}

interface SegmentMembershipTrigger {
  eventId: string;
  eventType: string;
}
