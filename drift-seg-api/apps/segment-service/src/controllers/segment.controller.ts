import * as dto from '@app/common/dto';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateSegmentDto } from '../dto/request';
import {
  SegmentDeltaResponseDto,
  SegmentMembersResponseDto,
  SegmentResponseDto,
} from '../dto/responses';
import { SegmentMembershipService, SegmentService } from '../services';

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

  @Post(':id/refresh')
  async refreshStatic(@Param('id') id: string): Promise<{ refreshed: true }> {
    await this.segmentService.refreshStaticSegment(id);
    return { refreshed: true };
  }

  @Delete(':id')
  async deleteWithDependents(
    @Param('id') id: string,
  ): Promise<{ deleted: true }> {
    await this.segmentService.deleteSegmentCascade(id);
    return { deleted: true };
  }

  @EventPattern(dto.TRANSACTION_CREATED_EVENT)
  async tansactionCreatedEvent(
    @Payload() event: dto.TransactionCreatedEvent,
  ): Promise<void> {
    await this.segmentMembershipService.processTransactionCreated(event);
  }
}
