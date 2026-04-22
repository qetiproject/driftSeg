import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  ManualRefreshResponseDto,
  SegmentDeltaResponseDto,
  SegmentMembershipResponseDto,
  SegmentResponseDto,
} from '../dto';
import { SegmentQueryApiService } from '../services/segment-query-api.service';

@Controller('segments')
export class SegmentQueryController {
  constructor(
    private readonly segmentQueryApiService: SegmentQueryApiService,
  ) {}

  @Post(':segmentId/refresh')
  manualRefresh(
    @Param('segmentId') segmentId: string,
  ): Promise<ManualRefreshResponseDto> {
    return this.segmentQueryApiService.manualRefresh(segmentId);
  }
  @Get()
  segments(): Promise<SegmentResponseDto[]> {
    return this.segmentQueryApiService.listSegments();
  }

  @Get(':segmentId/memberships')
  segmentMemberships(
    @Param('segmentId') segmentId: string,
  ): Promise<SegmentMembershipResponseDto[]> {
    return this.segmentQueryApiService.listMemberships(segmentId);
  }

  @Get(':segmentId/deltas')
  segmentDeltas(
    @Param('segmentId') segmentId: string,
  ): Promise<SegmentDeltaResponseDto[]> {
    return this.segmentQueryApiService.listDeltas(segmentId);
  }
}
