import { Injectable, Logger } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '@segment/constants/error-messages';
import { SegmentDependencyGraph } from '@segment/models/interfaces/segmentDependencyGraph';
import { SegmentMembershipTrigger } from '@segment/models/segment-trigger.interface';
import { Segment, SegmentDocument } from '@segment/models/segment.schema';
import { SegmentDeltaRepository } from '@segment/repositories/segment-delta.repository';
import { SegmentMembershipRepository } from '@segment/repositories/segment-membership.repository';
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

    const dependentIds =
      graph.dependentsBySegmentId.get(segmentId) ?? [];

    for (const depId of dependentIds) {
      if (visited.has(depId)) continue;

      visited.add(depId);
      queue.push(depId);
    }
  }
 }

  // reconcileSegmentMembershipForCustomer
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
    const dependenciesSatisfied = await satisfiesDependencies(
      segment,
      customerId,
      this,,
    );
    const shouldBeMember = matchesRule && dependenciesSatisfied;
    const currentMembership =
      await this.segmentMembershipRepository.findActiveMembership(
        segment._id,
        customerId,
      );

    if (shouldBeMember && !currentMembership) {
      await addCustomerToSegment(
        segment._id,
        segment.rules.kind,
        customerId,
        trigger,
        this,
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
        this,
      );
      return true;
    }

    return false;
  }
}
