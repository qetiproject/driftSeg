import { BadRequestException, Injectable } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '../constants/error-messages';
import { CreateSegmentDto } from '../dto';
import { SegmentRuleKind } from '../dto/create-segment';
import { SegmentRepository } from '../repositories';

@Injectable()
export class CreateSegmentFacade {
  private readonly activeDays = 30;

  constructor(private readonly segmentRepository: SegmentRepository) {}

  async createSegment(payload: CreateSegmentDto) {
    await this.ensureNameIsUnique(payload.name);
    return await this.segmentDynamic(payload);
  }

  private async segmentDynamic(payload: CreateSegmentDto) {
    if (payload.rules.kind !== SegmentRuleKind.ACTIVE_BUYERS) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.ONLY_ACTIVE_BUYERS_SUPPORTED,
      );
    }

    return await this.createActiveSegment(payload);
  }

  private async createActiveSegment(payload: CreateSegmentDto) {
    if (payload.rules.days !== this.activeDays) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.ACTIVE_BUYERS_REQUIRES_DAYS(this.activeDays),
      );
    }

    this.ensureNoDependenciesForActiveSegment(payload.dependsOnSegmentIds);

    return await this.segmentRepository.create({
      name: payload.name,
      type: payload.type,
      rules: {
        kind: SegmentRuleKind.ACTIVE_BUYERS,
        days: payload.rules.days,
      },
      dependsOnSegmentIds: [],
    });
  }

  private ensureNoDependenciesForActiveSegment(dependsOnSegmentIds?: string[]) {
    if ((dependsOnSegmentIds?.length ?? 0) > 0) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.ACTIVE_BUYERS_NO_DEPENDENCIES,
      );
    }
  }

  private async ensureNameIsUnique(name: string) {
    const alreadyExists = await this.segmentRepository.existsByName(name);
    if (alreadyExists) {
      throw new BadRequestException(SEGMENT_ERROR_MESSAGES.DUPLICATE_NAME);
    }
  }
}
