import { BadRequestException } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '../../constants/error-messages';
import { SegmentRepository } from '../../repositories';

export function noDependenciesSegment(
  dependsOnSegmentIds?: string[],
  message: string = SEGMENT_ERROR_MESSAGES.ACTIVE_BUYERS_NO_DEPENDENCIES,
): void {
  if ((dependsOnSegmentIds?.length ?? 0) > 0) {
    throw new BadRequestException(message);
  }
}

export async function segmentNameIsUnique(
  segmentRepository: SegmentRepository,
  name: string,
): Promise<void> {
  const alreadyExists = await segmentRepository.existsByName(name);
  if (alreadyExists) {
    throw new BadRequestException(SEGMENT_ERROR_MESSAGES.DUPLICATE_NAME);
  }
}
