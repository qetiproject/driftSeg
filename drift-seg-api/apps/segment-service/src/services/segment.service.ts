import { Injectable } from '@nestjs/common';

import { CreateSegmentDto, SegmentResponseDto } from '../dto';
import { CreateSegmentFacade } from './create-segment.facade';

@Injectable()
export class SegmentService {
  constructor(private readonly createSegmentFacade: CreateSegmentFacade) {}

  async createSegment(payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    return await this.createSegmentFacade.createSegment(payload);
  }
}
