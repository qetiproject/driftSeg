import { NotFoundException } from '@nestjs/common';
import { DAY_IN_MS } from '@segment/constants/constants';
import { SEGMENT_ERROR_MESSAGES } from '@segment/constants/error-messages';
import { SegmentResponseDto } from '@segment/dto';
import { SegmentDocument } from '@segment/models';
import {
  SegmentDeltaRepository,
  SegmentRepository,
} from '@segment/repositories';
import { Types } from 'mongoose';

export async function getSegmentById(
  segmentRepository: SegmentRepository,
  segmentId: string,
): Promise<SegmentDocument> {
  const segment = await segmentRepository.findById(segmentId);

  if (!segment) {
    throw new NotFoundException(SEGMENT_ERROR_MESSAGES.SEGMENT_NOT_FOUND);
  }

  return segment;
}

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
