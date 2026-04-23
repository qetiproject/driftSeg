import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateSegmentDto, SegmentResponseDto } from '../dto';
import { SegmentService } from '../services/segment.service';

@Controller('segments')
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) {}

  @Get()
  getAll(): Promise<SegmentResponseDto[]> {
    return this.segmentService.getAllSegments();
  }

  @Post()
  create(@Body() payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    return this.segmentService.createSegment(payload);
  }
}
