import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateSegmentDto, SegmentResponseDto } from '../dto';
import { SegmentRuleKind } from '../dto/create-segment';
import { SegmentRepository } from '../repositories';

@Injectable()
export class CreateSegmentFacade {
  constructor(private readonly segmentRepository: SegmentRepository) {}

  async createSegment(payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    if (payload.type !== SegmentType.DYNAMIC) {
      throw new BadRequestException(
        'Active buyers segment must use type "dynamic".',
      );
    }

    if (payload.rules.kind !== SegmentRuleKind.ACTIVE_BUYERS) {
      throw new BadRequestException(
        'Only active_buyers rule is supported for create segment.',
      );
    }

    const created = await this.segmentRepository.create({
      name: payload.name,
      type: payload.type,
      rules: {
        kind: payload.rules.kind,
        days: payload.rules.days,
      },
      dependsOnSegmentIds: (payload.dependsOnSegmentIds ?? []).map(
        (id) => new Types.ObjectId(id),
      ),
      isActive: false,
      lastComputedAt: undefined,
    });

    return {
      _id: created._id.toString(),
      name: created.name,
      type: payload.type,
      rules: payload.rules,
      dependsOnSegmentIds: (created.dependsOnSegmentIds ?? []).map((id) =>
        id.toString(),
      ),
      isActive: created.isActive,
      lastComputedAt: created.lastComputedAt?.toISOString(),
    };
  }
}
