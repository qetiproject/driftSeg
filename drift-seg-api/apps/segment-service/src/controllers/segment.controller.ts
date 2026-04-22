import { Body, Controller, Post } from '@nestjs/common';
import { CreateSegmentDto, SegmentResponseDto } from '../dto';
import { SegmentService } from '../services';

@Controller('segments')
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) {}

  @Post()
  create(@Body() payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    return this.segmentService.createSegment(payload);
  }

  // @Patch(':segmentId')
  // update(
  //   @Param('segmentId') segmentId: string,
  //   @Body() payload: UpdateSegmentDto,
  // ): Promise<SegmentResponseDto> {
  //   return this.segmentService.updateSegment(segmentId, payload);
  // }

  // @Delete(':segmentId')
  // remove(
  //   @Param('segmentId') segmentId: string,
  // ): Promise<SegmentResponseDto | null> {
  //   return this.segmentService.removeSegment(segmentId);
  // }
}
