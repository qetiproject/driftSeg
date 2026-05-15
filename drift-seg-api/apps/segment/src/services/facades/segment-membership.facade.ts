import { Injectable } from '@nestjs/common';
import { SegmentDependencyGraphService } from '@segment/services/segment-membership/segment-dependency-graph.service';
import { Types } from 'mongoose';
import { SegmentMembershipTrigger } from '../../models/segment-trigger.interface';
import {
  SegmentDeltaRepository,
  SegmentMembershipRepository,
} from '../../repositories';
import { SegmentQueryService } from '../segment methods/segment-query.service';
import { DynamicSegmentRecomputeService } from '../segment-membership/dynamic-segment-recompute.service';

@Injectable()
export class SegmentMembershipFacade {
  constructor(
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly segmentqueryService: SegmentQueryService,
    private readonly segmentDependencyGraphService: SegmentDependencyGraphService,
    private readonly dynamicSegmentRecomputeService: DynamicSegmentRecomputeService,
  ) {}

  async recomputeMembershipForCustomer(
    customerId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    const dynamicSegments =
      await this.segmentqueryService.getValidDynamicSegments();

    const graph = this.segmentDependencyGraphService.build(dynamicSegments);

    await this.dynamicSegmentRecomputeService.process(
      dynamicSegments,
      graph,
      customerId,
      trigger,
    );
  }

  // async refreshStaticSegmentMemberships(
  //   segment: SegmentDocument,
  //   customerIds: Types.ObjectId[],
  //   trigger: SegmentMembershipTrigger,
  // ): Promise<void> {
  //   if (
  //     segment.type !== SegmentTypeEnum.STATIC ||
  //     !isSegmentRuleInput(segment.rules)
  //   ) {
  //     return;
  //   }

  //   const eligibleCustomerIds = await collectEligibleCustomerIds(
  //     segment,
  //     customerIds,
  //     this.getFacadeDeps(),
  //   );
  //   const activeMemberships =
  //     await this.segmentMembershipRepository.findActiveMembersBySegmentId(
  //       segment._id,
  //     );
  //   const { addedCustomerIds, removedCustomerIds } =
  //     await syncStaticMembershipChanges(
  //       segment._id,
  //       eligibleCustomerIds,
  //       activeMemberships,
  //       this.getFacadeDeps(),
  //     );

  //   if (addedCustomerIds.length === 0 && removedCustomerIds.length === 0) {
  //     return;
  //   }

  //   await this.segmentDeltaRepository.create({
  //     segmentId: segment._id,
  //     segmentkind: segment.rules.kind,
  //     addedCustomerIds,
  //     removedCustomerIds,
  //     triggerEventId: trigger.eventId,
  //     triggerEventType: trigger.eventType,
  //     computedAt: new Date(),
  //   });
  // }
}
