import { DAY_IN_MS } from '@segment/constants/constants';
import { SegmentResponseDto } from '@segment/dto';
import { SegmentDocument } from '@segment/models';
import { SegmentDeltaRepository } from '@segment/repositories';
import { Types } from 'mongoose';

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

export function getSegmentDeltas(
  segmentDeltaRepository: SegmentDeltaRepository,
  segmentId: string,
) {
  return segmentDeltaRepository.findBySegmentId(new Types.ObjectId(segmentId));
}

export function getSinceDateByDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * DAY_IN_MS);
}
