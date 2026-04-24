import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import {
    ADD_CUSTOMER_TO_SEGMENT,
    REMOVE_CUSTOMER_FROM_SEGMENT,
} from '../../constants/constants';
import { SEGMENT_ERROR_MESSAGES } from '../../constants/error-messages';
import { SegmentRuleKind, SegmentTypeEnum } from '../../dto';
import { SegmentDocument } from '../../models';
import { SegmentMembershipTrigger } from '../../models/segment-trigger.interface';
import {
    SegmentDeltaRepository,
    SegmentMembershipRepository,
    SegmentRepository,
} from '../../repositories';
import { isSegmentRuleInput } from '../../utils/helper/segment-membership.helper';
import { SegmentRuleEvaluatorService } from '../segment-rule-evaluator.service';

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
    const dynamicSegments = segments.filter(
      (segment) =>
        segment.type === SegmentTypeEnum.DYNAMIC && isSegmentRuleInput(segment.rules),
    );

    const dynamicById = new Map(
      dynamicSegments.map((segment) => [segment._id.toString(), segment]),
    );
    const dependentBySegmentId = new Map<string, string[]>();
    for (const segment of segments) {
      for (const dependencyId of segment.dependsOnSegmentIds ?? []) {
        const key = dependencyId.toString();
        const dependents = dependentBySegmentId.get(key) ?? [];
        dependents.push(segment._id.toString());
        dependentBySegmentId.set(key, dependents);
      }
    }

    const queue = dynamicSegments.map((segment) => segment._id.toString());
    const queued = new Set(queue);
    while (queue.length > 0) {
      const segmentId = queue.shift();
      if (!segmentId) {
        continue;
      }
      queued.delete(segmentId);

      const segment = dynamicById.get(segmentId);
      if (!segment) {
        continue;
      }

      const hasChanged = await this.reconcileSegmentMembershipForCustomer(
        segment,
        customerId,
        trigger,
      );
      if (!hasChanged) {
        continue;
      }

      const dependentIds = dependentBySegmentId.get(segmentId) ?? [];
      for (const dependentId of dependentIds) {
        if (!dynamicById.has(dependentId) || queued.has(dependentId)) {
          continue;
        }
        queue.push(dependentId);
        queued.add(dependentId);
      }
    }
  }

  private async reconcileSegmentMembershipForCustomer(
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
    const satisfiesDependencies = await this.satisfiesDependencies(
      segment,
      customerId,
    );
    const shouldBeMember = matchesRule && satisfiesDependencies;
    const currentMembership =
      await this.segmentMembershipRepository.findActiveMembership(
        segment._id,
        customerId,
      );

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

  private async satisfiesDependencies(
    segment: SegmentDocument,
    customerId: Types.ObjectId,
  ): Promise<boolean> {
    const dependencyIds = segment.dependsOnSegmentIds ?? [];
    if (dependencyIds.length === 0) {
      return true;
    }

    for (const dependencyId of dependencyIds) {
      const membership = await this.segmentMembershipRepository.findActiveMembership(
        dependencyId,
        customerId,
      );
      if (!membership) {
        return false;
      }
    }

    return true;
  }

  async refreshStaticSegmentMemberships(
    segment: SegmentDocument,
    customerIds: Types.ObjectId[],
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    if (segment.type !== SegmentTypeEnum.STATIC || !isSegmentRuleInput(segment.rules)) {
      return;
    }

    const eligibleCustomerIds: Types.ObjectId[] = [];
    for (const customerId of customerIds) {
      const shouldBeMember =
        await this.segmentRuleEvaluatorService.shouldCustomerBelongToSegment(
          segment.rules,
          customerId,
        );
      if (shouldBeMember) {
        eligibleCustomerIds.push(customerId);
      }
    }

    const activeMemberships =
      await this.segmentMembershipRepository.findActiveMembersBySegmentId(segment._id);
    const activeByCustomerId = new Map(
      activeMemberships.map((membership) => [
        membership.customerId.toString(),
        membership,
      ]),
    );
    const eligibleIdSet = new Set(eligibleCustomerIds.map((id) => id.toString()));

    const addedCustomerIds: Types.ObjectId[] = [];
    for (const customerId of eligibleCustomerIds) {
      if (activeByCustomerId.has(customerId.toString())) {
        continue;
      }
      await this.segmentMembershipRepository.create({
        segmentId: segment._id,
        customerId,
        isActive: true,
      });
      addedCustomerIds.push(customerId);
    }

    const removedCustomerIds: Types.ObjectId[] = [];
    for (const activeMembership of activeMemberships) {
      if (eligibleIdSet.has(activeMembership.customerId.toString())) {
        continue;
      }
      await this.segmentMembershipRepository.deactivateMembership(activeMembership._id);
      removedCustomerIds.push(activeMembership.customerId);
    }

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

  private async addCustomerToSegment(
    segmentId: Types.ObjectId,
    segmentkind: SegmentRuleKind,
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
      segmentkind,
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
    segmentkind: SegmentRuleKind,
    customerObjectId: Types.ObjectId,
    trigger: SegmentMembershipTrigger,
  ): Promise<void> {
    await this.segmentMembershipRepository.deactivateMembership(membershipId);
    await this.segmentDeltaRepository.create({
      segmentId,
      segmentkind,
      addedCustomerIds: [],
      removedCustomerIds: [customerObjectId],
      triggerEventId: trigger.eventId,
      triggerEventType: trigger.eventType,
      computedAt: new Date(),
    });
    this.logger.log(REMOVE_CUSTOMER_FROM_SEGMENT);
  }
}
