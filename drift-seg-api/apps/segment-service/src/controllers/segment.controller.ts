import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  CreateSegmentDto,
  SegmentMembersResponseDto,
  SegmentResponseDto,
} from '../dto';
import { SegmentService } from '../services/segment.service';

@Controller('segments')
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) {}

  @Get()
  getAll(): Promise<SegmentResponseDto[]> {
    return this.segmentService.getAllSegments();
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string): Promise<SegmentMembersResponseDto> {
    return this.segmentService.getSegmentMembers(id);
  }

  @Post()
  create(@Body() payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    return this.segmentService.createSegment(payload);
  }
}
