import { BadRequestException } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '../../constants/error-messages';
import { SegmentRepository } from '../../repositories';

export function ensureNoDependenciesForActiveSegment(
  dependsOnSegmentIds?: string[],
): void {
  if ((dependsOnSegmentIds?.length ?? 0) > 0) {
    throw new BadRequestException(
      SEGMENT_ERROR_MESSAGES.ACTIVE_BUYERS_NO_DEPENDENCIES,
    );
  }
}

export async function ensureSegmentNameIsUnique(
  segmentRepository: SegmentRepository,
  name: string,
): Promise<void> {
  const alreadyExists = await segmentRepository.existsByName(name);
  if (alreadyExists) {
    throw new BadRequestException(SEGMENT_ERROR_MESSAGES.DUPLICATE_NAME);
  }
}
