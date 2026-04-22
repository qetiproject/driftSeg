import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { CreateSegmentDto, UpdateSegmentDto } from '../dto';
import { SegmentService } from '../services';

@Controller('segments')
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) {}

  @Post()
  create(@Body() payload: CreateSegmentDto) {
    return this.segmentService.createSegment(payload);
  }

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
}
