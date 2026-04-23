import { Injectable } from '@nestjs/common';
import { SegmentDocument } from '../models';

import { CreateSegmentDto, SegmentResponseDto } from '../dto';
import { SegmentRepository } from '../repositories';
import { CreateSegmentFacade } from './create-segment.facade';

@Injectable()
export class SegmentService {
  constructor(
    private readonly createSegmentFacade: CreateSegmentFacade,
    private readonly segmentRepository: SegmentRepository,
  ) {}

  async createSegment(payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    const created = await this.createSegmentFacade.createSegment(payload);
    return this.toSegmentResponse(created);
  }

  async getAllSegments(): Promise<SegmentResponseDto[]> {
    const segments = await this.segmentRepository.find({});
    return segments.map((segment) => this.toSegmentResponse(segment));
  }

  private toSegmentResponse(segment: SegmentDocument): SegmentResponseDto {
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
}
