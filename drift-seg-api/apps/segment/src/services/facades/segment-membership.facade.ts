import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { SegmentTypeEnum } from '../../dto';
import { Segment, SegmentDocument } from '../../models';
import { SegmentMembershipTrigger } from '../../models/segment-trigger.interface';
import {
  SegmentDeltaRepository,
  SegmentMembershipRepository,
} from '../../repositories';
import {
  collectEligibleCustomerIds,
  processDynamicSegmentQueue,
  syncStaticMembershipChanges,
} from '../../utils/segment-membership.facade.helper';
import { isSegmentRuleInput } from '../../utils/segment-membership.helper';
import { SegmentQueryService } from '../segment methods/segment-query.service';
import { SegmentRuleEvaluatorService } from '../segment-rule-evaluator.service';

@Injectable()
export class SegmentMembershipFacade {
  private readonly logger = new Logger(SegmentMembershipFacade.name);

  constructor(
    private readonly segmentRuleEvaluatorService: SegmentRuleEvaluatorService,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly segmentqueryService: SegmentQueryService,
  ) {}

  async recomputeMembershipForCustomer(
    customerId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    const dynamicValidSegments =
      await this.segmentqueryService.getValidDynamicSegments();
    const dynamicById = this.mapSegmentsById(dynamicValidSegments);
    const dependentBySegmentId =
      this.buildDependentSegmentMap(dynamicValidSegments);
    await processDynamicSegmentQueue(
      dynamicValidSegments,
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

  private mapSegmentsById(segments: Segment[]): Map<string, Segment> {
    return new Map(
      segments.map((segment) => [segment._id.toString(), segment]),
    );
  }

  private buildDependentSegmentMap(segments: Segment[]): Map<string, string[]> {
    const map = new Map<string, string[]>();

    for (const { _id, dependsOnSegmentIds = [] } of segments) {
      const dependentId = _id.toString();

      for (const dependencyId of dependsOnSegmentIds) {
        const key = dependencyId.toString();

        const existing = map.get(key);
        if (existing) {
          existing.push(dependentId);
        } else {
          map.set(key, [dependentId]);
        }
      }
    }

    return map;
  }
}
