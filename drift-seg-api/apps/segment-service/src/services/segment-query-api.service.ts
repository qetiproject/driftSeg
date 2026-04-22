import { Injectable } from '@nestjs/common';
import {
  ManualRefreshResponseDto,
  mapDeltaToDto,
  mapManualRefreshToDto,
  mapMembershipToDto,
  mapSegmentToDto,
  SegmentDeltaResponseDto,
  SegmentMembershipResponseDto,
  SegmentResponseDto,
} from '../dto';
import { SegmentService } from './segment.service';

@Injectable()
export class SegmentQueryApiService {
  constructor(private readonly segmentService: SegmentService) {}

  async manualRefresh(segmentId: string): Promise<ManualRefreshResponseDto> {
    const result = await this.segmentService.manualRefreshSegment(segmentId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return mapManualRefreshToDto(result);
  }

  async listSegments(): Promise<SegmentResponseDto[]> {
    const segments = await this.segmentService.listSegments();
    return segments.map(mapSegmentToDto);
  }

  async listMemberships(
    segmentId: string,
  ): Promise<SegmentMembershipResponseDto[]> {
    const memberships =
      await this.segmentService.listSegmentMemberships(segmentId);
    return memberships.map(mapMembershipToDto);
  }

  async listDeltas(segmentId: string): Promise<SegmentDeltaResponseDto[]> {
    const deltas = await this.segmentService.listSegmentDeltas(segmentId);
    return deltas.map(mapDeltaToDto);
  }
}
