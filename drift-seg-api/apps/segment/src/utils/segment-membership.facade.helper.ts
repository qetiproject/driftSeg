import {
  ADD_CUSTOMER_TO_SEGMENT,
  REMOVE_CUSTOMER_FROM_SEGMENT,
} from '@segment/constants/constants';
import { SegmentRuleInput, SegmentRuleKind } from '@segment/dto';
import { SegmentDocument } from '@segment/models';
import { SegmentMembershipFacadeDeps } from '@segment/models/interfaces/segmentmembershiodeps';
import { SegmentMembershipTrigger } from '@segment/models/segment-trigger.interface';
import { Types } from 'mongoose';

interface ActiveMembershipRecord {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
}

function enqueueDependentDynamicSegments(
  segmentId: string,
  dependentBySegmentId: Map<string, string[]>,
  dynamicById: Map<string, SegmentDocument>,
  queue: string[],
  queued: Set<string>,
): void {
  const dependentIds = dependentBySegmentId.get(segmentId) ?? [];

  for (const dependentId of dependentIds) {
    if (!dynamicById.has(dependentId) || queued.has(dependentId)) {
      continue;
    }

    queue.push(dependentId);
    queued.add(dependentId);
  }
}

export async function processDynamicSegmentQueue(
  dynamicSegments: SegmentDocument[],
  dynamicSegmentById: Map<string, SegmentDocument>,
  dependentBySegmentId: Map<string, string[]>,
  customerId: Types.ObjectId,
  trigger: SegmentMembershipTrigger,
  deps: SegmentMembershipFacadeDeps,
): Promise<void> {
  const queue = createInitialQueue(dynamicSegments);
  const visited = new Set(queue);

  for (let i = 0; i < queue.length; i++) {
    const segmentId = queue[i];
    visited.delete(segmentId);
    const segment = dynamicSegmentById.get(segmentId);
    if (!segment) {
      continue;
    }

    const hasChanged = await reconcileSegmentMembershipForCustomer(
      segment,
      customerId,
      trigger,
      deps,
    );

    if (!hasChanged) {
      continue;
    }

    enqueueDependentDynamicSegments(
      segmentId,
      dependentBySegmentId,
      dynamicSegmentById,
      queue,
      visited,
    );
  }
}

// createInitialQueue
function createInitialQueue(segments: SegmentDocument[]): string[] {
  return segments.map((segment) => segment._id.toString());
}

export async function satisfiesDependencies(
  segment: SegmentDocument,
  customerId: Types.ObjectId,
  deps: SegmentMembershipFacadeDeps,
): Promise<boolean> {
  const dependencyIds = segment.dependsOnSegmentIds ?? [];
  if (dependencyIds.length === 0) {
    return true;
  }

  for (const dependencyId of dependencyIds) {
    const membership =
      await deps.segmentMembershipRepository.findActiveMembership(
        dependencyId,
        customerId,
      );
    if (!membership) {
      return false;
    }
  }

  return true;
}

export async function collectEligibleCustomerIds(
  segment: SegmentDocument,
  customerIds: Types.ObjectId[],
  deps: SegmentMembershipFacadeDeps,
): Promise<Types.ObjectId[]> {
  const eligibleCustomerIds: Types.ObjectId[] = [];

  for (const customerId of customerIds) {
    const shouldBeMember =
      await deps.segmentRuleEvaluatorService.shouldCustomerBelongToSegment(
        segment.rules as SegmentRuleInput,
        customerId,
      );
    if (shouldBeMember) {
      eligibleCustomerIds.push(customerId);
    }
  }

  return eligibleCustomerIds;
}

export async function syncStaticMembershipChanges(
  segmentId: Types.ObjectId,
  eligibleCustomerIds: Types.ObjectId[],
  activeMemberships: ActiveMembershipRecord[],
  deps: SegmentMembershipFacadeDeps,
): Promise<{
  addedCustomerIds: Types.ObjectId[];
  removedCustomerIds: Types.ObjectId[];
}> {
  const activeByCustomerId = new Map(
    activeMemberships.map((membership) => [
      membership.customerId.toString(),
      membership,
    ]),
  );
  const eligibleIdSet = new Set(
    eligibleCustomerIds.map((customerId) => customerId.toString()),
  );

  const addedCustomerIds = await addMissingStaticMembers(
    segmentId,
    eligibleCustomerIds,
    activeByCustomerId,
    deps,
  );
  const removedCustomerIds = await removeOutdatedStaticMembers(
    activeMemberships,
    eligibleIdSet,
    deps,
  );

  return { addedCustomerIds, removedCustomerIds };
}

export async function addMissingStaticMembers(
  segmentId: Types.ObjectId,
  eligibleCustomerIds: Types.ObjectId[],
  activeByCustomerId: Map<string, unknown>,
  deps: SegmentMembershipFacadeDeps,
): Promise<Types.ObjectId[]> {
  const addedCustomerIds: Types.ObjectId[] = [];

  for (const customerId of eligibleCustomerIds) {
    if (activeByCustomerId.has(customerId.toString())) {
      continue;
    }

    await deps.segmentMembershipRepository.create({
      segmentId,
      customerId,
      isActive: true,
    });
    addedCustomerIds.push(customerId);
  }

  return addedCustomerIds;
}

export async function removeOutdatedStaticMembers(
  activeMemberships: ActiveMembershipRecord[],
  eligibleIdSet: Set<string>,
  deps: SegmentMembershipFacadeDeps,
): Promise<Types.ObjectId[]> {
  const removedCustomerIds: Types.ObjectId[] = [];

  for (const activeMembership of activeMemberships) {
    if (eligibleIdSet.has(activeMembership.customerId.toString())) {
      continue;
    }

    await deps.segmentMembershipRepository.deactivateMembership(
      activeMembership._id,
    );
    removedCustomerIds.push(activeMembership.customerId);
  }

  return removedCustomerIds;
}

export async function addCustomerToSegment(
  segmentId: Types.ObjectId,
  segmentkind: SegmentRuleKind,
  customerId: Types.ObjectId,
  trigger: SegmentMembershipTrigger,
  deps: SegmentMembershipFacadeDeps,
): Promise<void> {
  await deps.segmentMembershipRepository.create({
    segmentId,
    customerId,
    isActive: true,
  });
  await deps.segmentDeltaRepository.create({
    segmentId,
    segmentkind,
    addedCustomerIds: [customerId],
    removedCustomerIds: [],
    triggerEventId: trigger.eventId,
    triggerEventType: trigger.eventType,
    computedAt: new Date(),
  });
  deps.logger.log(
    ADD_CUSTOMER_TO_SEGMENT(customerId.toString(), segmentId.toString()),
  );
}

export async function removeCustomerFromSegment(
  membershipId: Types.ObjectId,
  segmentId: Types.ObjectId,
  segmentkind: SegmentRuleKind,
  customerObjectId: Types.ObjectId,
  trigger: SegmentMembershipTrigger,
  deps: SegmentMembershipFacadeDeps,
): Promise<void> {
  await deps.segmentMembershipRepository.deactivateMembership(membershipId);
  await deps.segmentDeltaRepository.create({
    segmentId,
    segmentkind,
    addedCustomerIds: [],
    removedCustomerIds: [customerObjectId],
    triggerEventId: trigger.eventId,
    triggerEventType: trigger.eventType,
    computedAt: new Date(),
  });
  deps.logger.log(
    REMOVE_CUSTOMER_FROM_SEGMENT(
      customerObjectId.toString(),
      segmentId.toString(),
    ),
  );
}
