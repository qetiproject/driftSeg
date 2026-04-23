import * as dto from '@app/common/dto';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  CreateSegmentDto,
  SegmentDeltaResponseDto,
  SegmentMembersResponseDto,
  SegmentResponseDto,
} from '../dto';
import { SegmentMembershipService } from '../services/segment-membership.service';
import { SegmentService } from '../services/segment.service';

@Controller('segments')
export class SegmentController {
  constructor(
    private readonly segmentService: SegmentService,
    private readonly segmentMembershipService: SegmentMembershipService,
  ) {}

  @Get()
  getAll(): Promise<SegmentResponseDto[]> {
    return this.segmentService.getAllSegments();
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string): Promise<SegmentMembersResponseDto> {
    return this.segmentService.getSegmentMembers(id);
  }

  @Get(':id/deltas')
  getDeltas(@Param('id') id: string): Promise<SegmentDeltaResponseDto[]> {
    return this.segmentService.getSegmentDeltas(id);
  }

  @Post()
  create(@Body() payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    return this.segmentService.createSegment(payload);
  }

  @EventPattern(dto.TRANSACTION_CREATED_EVENT)
  async tansactionCreatedEvent(
    @Payload() event: dto.TransactionCreatedEvent,
  ): Promise<void> {
    await this.segmentMembershipService.processTransactionCreated(event);
  }
}
