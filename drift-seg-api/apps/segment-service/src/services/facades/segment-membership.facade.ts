import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import {
    ADD_CUSTOMER_TO_SEGMENT,
    REMOVE_CUSTOMER_FROM_SEGMENT,
} from '../../constants/constants';
import { SEGMENT_ERROR_MESSAGES } from '../../constants/error-messages';
import { SegmentTypeEnum } from '../../dto';
import { SegmentMembershipTrigger } from '../../models/segment-trigger.interface';
import {
    SegmentDeltaRepository,
    SegmentMembershipRepository,
    SegmentRepository,
} from '../../repositories';
import { isSegmentRuleInput } from '../../utils/helper/segment-membership.helper';
import { SegmentMembershipService } from '../segment-membership.service';
import { SegmentRuleEvaluatorService } from '../segment-rule-evaluator.service';

@Injectable()
export class SegmentMembershipFacade {
  private readonly logger = new Logger(SegmentMembershipService.name);

  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentRuleEvaluatorService: SegmentRuleEvaluatorService,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
  ) {}

  async recomputeMembershipForCustomer(
    customerId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    const segments = await this.segmentRepository.find({
      type: SegmentTypeEnum.DYNAMIC,
    });
    for (const segment of segments) {
      if (!isSegmentRuleInput(segment.rules)) {
        this.logger.warn(
          SEGMENT_ERROR_MESSAGES.INVALID_SEGMENT_RULES_WARNING(
            segment._id.toString(),
          ),
        );
        continue;
      }
      const shouldBeMember =
        await this.segmentRuleEvaluatorService.shouldCustomerBelongToSegment(
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
    customerId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    await this.segmentMembershipRepository.create({
      segmentId,
      customerId,
      isActive: true,
    });
    await this.segmentDeltaRepository.create({
      segmentId,
      addedCustomerIds: [customerId],
      removedCustomerIds: [],
      triggerEventId: trigger.eventId,
      triggerEventType: trigger.eventType,
      computedAt: new Date(),
    });
    this.logger.log(ADD_CUSTOMER_TO_SEGMENT);
  }

  private async removeCustomerFromSegment(
    membershipId: Types.ObjectId,
    segmentId: Types.ObjectId,
    customerObjectId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    await this.segmentMembershipRepository.deactivateMembership(membershipId);
    await this.segmentDeltaRepository.create({
      segmentId,
      addedCustomerIds: [],
      removedCustomerIds: [customerObjectId],
      triggerEventId: trigger.eventId,
      triggerEventType: trigger.eventType,
      computedAt: new Date(),
    });
    this.logger.log(REMOVE_CUSTOMER_FROM_SEGMENT);
  }
}
