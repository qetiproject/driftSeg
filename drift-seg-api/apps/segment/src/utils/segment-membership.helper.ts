import {
  SCHEDULER_EVENT_TYPE,
  SEGMENT_STATIC_MANUAL_REFRESH_EVENT,
  SEGMENT_STATIC_REFRESH_EVENT_ID_PREFIX,
} from '@segment/constants/constants';
import { SegmentRuleInput, SegmentRuleKind } from '@segment/dto';
import { SegmentMembershipTrigger } from '@segment/models/segment-trigger.interface';
import { Types } from 'mongoose';

export function isSegmentRuleInput(value: unknown): value is SegmentRuleInput {
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

export function buildSchedulerTrigger(
  customerId: Types.ObjectId,
  now: Date = new Date(),
): SegmentMembershipTrigger {
  return {
    eventId: `scheduler-${now.toISOString()}-${customerId.toString()}`,
    eventType: SCHEDULER_EVENT_TYPE,
  };
}

export function buildStaticRefreshTrigger(
  segmentId: string,
  now: Date = new Date(),
): SegmentMembershipTrigger {
  return {
    eventId: `${SEGMENT_STATIC_REFRESH_EVENT_ID_PREFIX}-${segmentId}-${now.toISOString()}`,
    eventType: SEGMENT_STATIC_MANUAL_REFRESH_EVENT,
  };
}
