import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  CreateSegmentDto,
  UpdateSegmentDto,
} from '../../segment-service/src/dto';
import { SegmentService } from '../../segment-service/src/services/segment.service';

@Controller('segments')
export class SegmentsController {
  constructor(private readonly segmentService: SegmentService) {}

  @Post()
  create(@Body() payload: CreateSegmentDto) {
    return this.segmentService.createSegment(payload);
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

  @Patch(':segmentId')
  update(
    @Param('segmentId') segmentId: string,
    @Body() payload: UpdateSegmentDto,
  ) {
    return this.segmentService.updateSegment(segmentId, payload);
  }

  @Delete(':segmentId')
  remove(@Param('segmentId') segmentId: string) {
    return this.segmentService.removeSegment(segmentId);
  }

  @Post(':segmentId/refresh')
  manualRefresh(@Param('segmentId') segmentId: string) {
    return this.segmentService.manualRefreshSegment(segmentId);
  }
}
