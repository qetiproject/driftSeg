import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { SegmentTypeEnum } from '../dto';
import { SegmentDocument } from '../models';
import { SegmentMembershipTrigger } from '../models/segment-trigger.interface';
import {
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from '../repositories';
import {
  buildDependentSegmentMap,
  buildSegmentByIdMap,
  collectEligibleCustomerIds,
  getDynamicSegments,
  processDynamicSegmentQueue,
  syncStaticMembershipChanges,
} from '../utils/segment-membership.facade.helper';
import { isSegmentRuleInput } from '../utils/segment-membership.helper';
import { SegmentRuleEvaluatorService } from './segment-rule-evaluator.service';

@Injectable()
export class SegmentMembershipFacade {
  private readonly logger = new Logger(SegmentMembershipFacade.name);

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
    const segments = await this.segmentRepository.find({});
    const dynamicSegments = getDynamicSegments(segments);
    const dynamicById = buildSegmentByIdMap(dynamicSegments);
    const dependentBySegmentId = buildDependentSegmentMap(segments);
    await processDynamicSegmentQueue(
      dynamicSegments,
      dynamicById,
      dependentBySegmentId,
      customerId,
      trigger,
      this.getFacadeDeps(),
    );
  }

  async refreshStaticSegmentMemberships(
    segment: SegmentDocument,
    customerIds: Types.ObjectId[],
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    if (
      segment.type !== SegmentTypeEnum.STATIC ||
      !isSegmentRuleInput(segment.rules)
    ) {
      return;
    }

    const eligibleCustomerIds = await collectEligibleCustomerIds(
      segment,
      customerIds,
      this.getFacadeDeps(),
    );
    const activeMemberships =
      await this.segmentMembershipRepository.findActiveMembersBySegmentId(
        segment._id,
      );
    const { addedCustomerIds, removedCustomerIds } =
      await syncStaticMembershipChanges(
        segment._id,
        eligibleCustomerIds,
        activeMemberships,
        this.getFacadeDeps(),
      );

    if (addedCustomerIds.length === 0 && removedCustomerIds.length === 0) {
      return;
    }

    await this.segmentDeltaRepository.create({
      segmentId: segment._id,
      segmentkind: segment.rules.kind,
      addedCustomerIds,
      removedCustomerIds,
      triggerEventId: trigger.eventId,
      triggerEventType: trigger.eventType,
      computedAt: new Date(),
    });
  }

  private getFacadeDeps() {
    return {
      logger: this.logger,
      segmentRuleEvaluatorService: this.segmentRuleEvaluatorService,
      segmentMembershipRepository: this.segmentMembershipRepository,
      segmentDeltaRepository: this.segmentDeltaRepository,
    };
  }
}
