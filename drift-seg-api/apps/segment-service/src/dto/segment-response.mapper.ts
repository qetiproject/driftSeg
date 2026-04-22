import { Types } from 'mongoose';
import { ManualRefreshResponseDto } from './responses/manual-refresh-response.dto';
import { SegmentDeltaResponseDto } from './responses/segment-delta-response.dto';
import {
  SegmentResponseDto,
  SegmentResponseType,
} from './responses/segment-response.dto';
import { SegmentMembershipResponseDto } from './segment-membership-response.dto';

type WithId = {
  _id: Types.ObjectId | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type SegmentLike = WithId & {
  name: string;
  type: 'dynamic' | 'static';
  rules: Record<string, unknown>;
  dependsOnSegmentIds: Array<Types.ObjectId | string>;
  isActive: boolean;
  lastComputedAt?: Date | string;
};

type SegmentMembershipLike = WithId & {
  segmentId: Types.ObjectId | string;
  customerId: Types.ObjectId | string;
};

type SegmentDeltaLike = WithId & {
  segmentId: Types.ObjectId | string;
  addedCustomerIds: Array<Types.ObjectId | string>;
  removedCustomerIds: Array<Types.ObjectId | string>;
  reason: string;
  triggeredBySegmentId?: Types.ObjectId | string;
};

const toStringId = (value: Types.ObjectId | string | undefined): string =>
  value ? value.toString() : '';

const toIso = (value?: Date | string): string | undefined =>
  value ? new Date(value).toISOString() : undefined;

export const mapSegmentToDto = (segment: SegmentLike): SegmentResponseDto => ({
  _id: toStringId(segment._id),
  name: segment.name,
  type:
    segment.type === SegmentResponseType.STATIC
      ? SegmentResponseType.STATIC
      : SegmentResponseType.DYNAMIC,
  rules: segment.rules,
  dependsOnSegmentIds: (segment.dependsOnSegmentIds ?? []).map((id) =>
    toStringId(id),
  ),
  isActive: segment.isActive,
  lastComputedAt: toIso(segment.lastComputedAt),
  createdAt: toIso(segment.createdAt),
  updatedAt: toIso(segment.updatedAt),
});

export const mapMembershipToDto = (
  membership: SegmentMembershipLike,
): SegmentMembershipResponseDto => ({
  _id: toStringId(membership._id),
  segmentId: toStringId(membership.segmentId),
  customerId: toStringId(membership.customerId),
  createdAt: toIso(membership.createdAt),
  updatedAt: toIso(membership.updatedAt),
});

export const mapDeltaToDto = (
  delta: SegmentDeltaLike,
): SegmentDeltaResponseDto => ({
  _id: toStringId(delta._id),
  segmentId: toStringId(delta.segmentId),
  addedCustomerIds: (delta.addedCustomerIds ?? []).map((id) => toStringId(id)),
  removedCustomerIds: (delta.removedCustomerIds ?? []).map((id) =>
    toStringId(id),
  ),
  reason: delta.reason,
  triggeredBySegmentId: delta.triggeredBySegmentId
    ? toStringId(delta.triggeredBySegmentId)
    : undefined,
  createdAt: toIso(delta.createdAt),
  updatedAt: toIso(delta.updatedAt),
});

export const mapManualRefreshToDto = (input: {
  segment: SegmentLike;
  delta: SegmentDeltaLike;
}): ManualRefreshResponseDto => ({
  segment: mapSegmentToDto(input.segment),
  delta: mapDeltaToDto(input.delta),
});
