import { Injectable } from '@nestjs/common';
import { CreateSegmentDto } from '@segment/dto';
import { SegmentResponseDto } from '@segment/dto/responses/segment-response.dto';
import { SegmentCommandFacade } from '@segment/services/facades/segment-command.facade';
import { toSegmentResponse } from '@segment/utils';

@Injectable()
export class SegmentCommandService {
  constructor(private readonly segmentCommandFacade: SegmentCommandFacade) {}

  async createSegment(payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    const created = await this.segmentCommandFacade.createSegment(payload);
    return toSegmentResponse(created);
  }

  async deleteSegmentCascade(segmentId: string): Promise<void> {
    await this.segmentCommandFacade.deleteSegmentCascade(segmentId);
  }
}
