import { Types } from 'mongoose';
import { SegmentResponseDto } from '../../dto/responses';
import { SegmentDocument } from '../../models';
import {
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

export function segmentById(
  segmentRepository: SegmentRepository,
  segmentId: string,
): Promise<SegmentDocument> {
  return segmentRepository.findOne({ _id: segmentId });
}

export function segmentMemberships(
  segmentMembershipRepository: SegmentMembershipRepository,
  segmentId: string,
) {
  return segmentMembershipRepository.findActiveMembersBySegmentId(
    new Types.ObjectId(segmentId),
  );
}
