import { Types } from 'mongoose';
import { DAY_IN_MS } from '../../constants/constants';
import { SegmentResponseDto } from '../../dto/responses';
import { SegmentDocument } from '../../models';
import {
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from '../../repositories';

export function toSegmentResponse(
  segment: SegmentDocument,
): SegmentResponseDto {
  return {
    _id: segment._id.toString(),
    name: segment.name,
    type: segment.type,
    rules: segment.rules,
    dependsOnSegmentIds: (segment.dependsOnSegmentIds ?? []).map((id) =>
      id.toString(),
    ),
    lastComputedAt: segment.lastComputedAt?.toISOString(),
  };
}

export function getSegmentById(
  segmentRepository: SegmentRepository,
  segmentId: string,
): Promise<SegmentDocument> {
  return segmentRepository.findOne({ _id: segmentId });
}

export function getSegmentMembers(
  segmentMembershipRepository: SegmentMembershipRepository,
  segmentId: string,
) {
  return segmentMembershipRepository.findActiveMembersBySegmentId(
    new Types.ObjectId(segmentId),
  );
}

export function getSegmentDeltas(
  segmentDeltaRepository: SegmentDeltaRepository,
  segmentId: string,
) {
  return segmentDeltaRepository.findBySegmentId(new Types.ObjectId(segmentId));
}

export function getSinceDateByDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * DAY_IN_MS);
}
