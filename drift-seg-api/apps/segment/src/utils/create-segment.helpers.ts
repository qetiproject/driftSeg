import { BadRequestException } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '@segment/constants/error-messages';
import { CreateSegmentDto, SegmentTypeEnum } from '@segment/dto';
import { SegmentRepository } from '@segment/repositories';
import { Types } from 'mongoose';

export async function segmentNameIsUnique(
  segmentRepository: SegmentRepository,
  name: string,
): Promise<void> {
  const alreadyExists = await segmentRepository.existsByName(name);
  if (alreadyExists) {
    throw new BadRequestException(SEGMENT_ERROR_MESSAGES.DUPLICATE_NAME);
  }
}

export function baseSegmentCreatePayload(payload: CreateSegmentDto): {
  name: string;
  type: SegmentTypeEnum;
  dependsOnSegmentIds: Types.ObjectId[];
} {
  return {
    name: payload.name,
    type: payload.type,
    dependsOnSegmentIds: (payload.dependsOnSegmentIds ?? []).map(
      (id) => new Types.ObjectId(id),
    ),
  };
}
