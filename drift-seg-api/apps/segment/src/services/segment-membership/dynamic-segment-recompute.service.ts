import { Injectable } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '@segment/constants/error-messages';
import { SegmentDependencyGraph } from '@segment/models/interfaces/segmentDependencyGraph';
import { SegmentMembershipFacadeDeps } from '@segment/models/interfaces/segmentmembershiodeps';
import { SegmentMembershipTrigger } from '@segment/models/segment-trigger.interface';
import { Segment, SegmentDocument } from '@segment/models/segment.schema';
import { SegmentMembershipRepository } from '@segment/repositories';
import {
  addCustomerToSegment,
  isSegmentRuleInput,
  removeCustomerFromSegment,
  satisfiesDependencies,
} from '@segment/utils';
import { Types } from 'mongoose';
import { SegmentRuleEvaluatorService } from '../segment-rule-evaluator.service';

@Injectable()
export class DynamicSegmentRecomputeService {
  onstructor(
    private readonly segmentRuleEvaluatorService: SegmentRuleEvaluatorService,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
  ) {}
  
  async process(
    dynamicSegments: Segment[],
    graph: SegmentDependencyGraph,
    customerId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
    deps: SegmentMembershipFacadeDeps,
  ): Promise<void> {
    const queue = dynamicSegments.map((s) => s._id.toString());

    const queued = new Set(queue);

    for (let i = 0; i < queue.length; i++) {
      const segmentId = queue[i];

      queued.delete(segmentId);

      const segment = graph.segmentsById.get(segmentId);

      if (!segment) continue;

      const hasChanged = await this.reconcileSegmentMembershipForCustomer(
        segment,
        customerId,
        trigger,
        deps,
      );

      if (!hasChanged) continue;

      const dependents = graph.dependentBySegmentId.get(segmentId) ?? [];

      for (const depId of dependents) {
        if (queued.has(depId)) continue;

        queue.push(depId);
        queued.add(depId);
      }
    }
  }

  // reconcileSegmentMembershipForCustomer
  async reconcileSegmentMembershipForCustomer(
    segment: SegmentDocument,
    customerId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
    deps: SegmentMembershipFacadeDeps,
  ): Promise<boolean> {
    if (!isSegmentRuleInput(segment.rules)) {
      deps.logger.warn(
        SEGMENT_ERROR_MESSAGES.INVALID_SEGMENT_RULES_WARNING(
          segment._id.toString(),
        ),
      );
      return false;
    }

    const matchesRule =
      await deps.segmentRuleEvaluatorService.shouldCustomerBelongToSegment(
        segment.rules,
        customerId,
      );
    const dependenciesSatisfied = await satisfiesDependencies(
      segment,
      customerId,
      deps,
    );
    const shouldBeMember = matchesRule && dependenciesSatisfied;
    const currentMembership =
      await deps.segmentMembershipRepository.findActiveMembership(
        segment._id,
        customerId,
      );

    if (shouldBeMember && !currentMembership) {
      await addCustomerToSegment(
        segment._id,
        segment.rules.kind,
        customerId,
        trigger,
        deps,
      );
      return true;
    }

    if (!shouldBeMember && currentMembership) {
      await removeCustomerFromSegment(
        currentMembership._id,
        segment._id,
        segment.rules.kind,
        customerId,
        trigger,
        deps,
      );
      return true;
    }

    return false;
  }
}
