import { Controller, Get, Param, Post } from '@nestjs/common';
import { SegmentService } from '../services';

@Controller('segments')
export class SegmentQueryController {
  constructor(private readonly segmentService: SegmentService) {}

  @Post(':segmentId/refresh')
  manualRefresh(@Param('segmentId') segmentId: string) {
    return this.segmentService.manualRefreshSegment(segmentId);
  }
  @Get()
  list() {
    return this.segmentService.listSegments();
  }

  @Get(':segmentId/memberships')
  memberships(@Param('segmentId') segmentId: string) {
    return this.segmentService.listSegmentMemberships(segmentId);
  }

  @Get(':segmentId/deltas')
  deltas(@Param('segmentId') segmentId: string) {
    return this.segmentService.listSegmentDeltas(segmentId);
  }
}
