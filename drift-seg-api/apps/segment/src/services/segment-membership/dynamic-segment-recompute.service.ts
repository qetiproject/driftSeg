import { Injectable, Logger } from '@nestjs/common';
import {
  ADD_CUSTOMER_TO_SEGMENT,
  REMOVE_CUSTOMER_FROM_SEGMENT,
} from '@segment/constants/constants';
import { SEGMENT_ERROR_MESSAGES } from '@segment/constants/error-messages';
import { SegmentRuleKind } from '@segment/dto/segment-rule';
import { SegmentDependencyGraph } from '@segment/models/interfaces/segmentDependencyGraph';
import { SegmentMembershipTrigger } from '@segment/models/segment-trigger.interface';
import { Segment, SegmentDocument } from '@segment/models/segment.schema';
import { SegmentDeltaRepository } from '@segment/repositories/segment-delta.repository';
import { SegmentMembershipRepository } from '@segment/repositories/segment-membership.repository';
import { SegmentRuleEvaluatorService } from '@segment/services/segment-rule-evaluator.service';
import { isSegmentRuleInput } from '@segment/utils';
import { Types } from 'mongoose';

@Injectable()
export class DynamicSegmentRecomputeService {
  constructor(
    private readonly segmentRuleEvaluatorService: SegmentRuleEvaluatorService,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
  ) {}

  private readonly logger = new Logger(DynamicSegmentRecomputeService.name);

  async process(
    dynamicSegments: Segment[],
    graph: SegmentDependencyGraph,
    customerId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    const queue: string[] = dynamicSegments.map((s) => s._id.toString());
    const visited = new Set(queue);

    while (queue.length > 0) {
      const segmentId = queue.shift()!;

      const segment = graph.segmentsById.get(segmentId);
      if (!segment) continue;

      const membershipChanged =
        await this.reconcileSegmentMembershipForCustomer(
          segment,
          customerId,
          trigger,
        );

      if (!membershipChanged) continue;

      const dependentIds = graph.dependentsBySegmentId.get(segmentId) ?? [];

      for (const depId of dependentIds) {
        if (visited.has(depId)) continue;

        visited.add(depId);
        queue.push(depId);
      }
    }
  }

  async reconcileSegmentMembershipForCustomer(
    segment: SegmentDocument,
    customerId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<boolean> {
    if (!isSegmentRuleInput(segment.rules)) {
      this.logger.warn(
        SEGMENT_ERROR_MESSAGES.INVALID_SEGMENT_RULES_WARNING(
          segment._id.toString(),
        ),
      );
      return false;
    }

    const matchesRule =
      await this.segmentRuleEvaluatorService.shouldCustomerBelongToSegment(
        segment.rules,
        customerId,
      );

    const currentMembership =
      await this.segmentMembershipRepository.findActiveMembership(
        segment._id,
        customerId,
      );

    const dependenciesSatisfied = await this.hasRequiredSegmentMemberships(
      segment,
      customerId,
    );

    if (!matchesRule && !currentMembership) return false;

    const shouldBeMember = matchesRule && dependenciesSatisfied;

    if (shouldBeMember && !currentMembership) {
      await this.addCustomerToSegment(
        segment._id,
        segment.rules.kind,
        customerId,
        trigger,
      );
      return true;
    }

    if (!shouldBeMember && currentMembership) {
      await this.removeCustomerFromSegment(
        currentMembership._id,
        segment._id,
        segment.rules.kind,
        customerId,
        trigger,
      );
      return true;
    }

    return false;
  }

  async hasRequiredSegmentMemberships(
    segment: SegmentDocument,
    customerId: Types.ObjectId,
  ): Promise<boolean> {
    const dependencyIds = segment.dependsOnSegmentIds ?? [];

    if (!dependencyIds?.length) {
      return true;
    }

    const count = await this.segmentMembershipRepository.countActiveMemberships(
      dependencyIds,
      customerId,
    );

    return count === dependencyIds.length;
  }

  async addCustomerToSegment(
    segmentId: Types.ObjectId,
    segmentKind: SegmentRuleKind,
    customerId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    const computedAt = new Date();

    await this.segmentMembershipRepository.create({
      segmentId,
      customerId,
      isActive: true,
    });
    await this.createSegmentDelta({
      segmentId,
      segmentKind,
      addedCustomerIds: [customerId],
      removedCustomerIds: [],
      trigger,
      computedAt,
    });
    this.logger.log(
      ADD_CUSTOMER_TO_SEGMENT(customerId.toString(), segmentId.toString()),
    );
  }

  async removeCustomerFromSegment(
    membershipId: Types.ObjectId,
    segmentId: Types.ObjectId,
    segmentKind: SegmentRuleKind,
    customerId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    const computedAt = new Date();

    await this.segmentMembershipRepository.deactivateMembership(membershipId);
    await this.createSegmentDelta({
      segmentId,
      segmentKind,
      addedCustomerIds: [],
      removedCustomerIds: [customerId],
      trigger,
      computedAt,
    });

    this.logger.log(
      REMOVE_CUSTOMER_FROM_SEGMENT(customerId.toString(), segmentId.toString()),
    );
  }

  private async createSegmentDelta(params: {
    segmentId: Types.ObjectId;
    segmentKind: SegmentRuleKind;
    addedCustomerIds: Types.ObjectId[];
    removedCustomerIds: Types.ObjectId[];
    trigger: SegmentMembershipTrigger;
    computedAt: Date;
  }): Promise<void> {
    const {
      segmentId,
      segmentKind,
      addedCustomerIds,
      removedCustomerIds,
      trigger,
      computedAt,
    } = params;

    const { eventId, eventType } = trigger;

    await this.segmentDeltaRepository.create({
      segmentId,
      segmentKind,
      addedCustomerIds,
      removedCustomerIds,
      triggerEventId: eventId,
      triggerEventType: eventType,
      computedAt,
    });
  }
}
