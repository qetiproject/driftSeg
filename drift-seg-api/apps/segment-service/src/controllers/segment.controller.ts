import * as dto from '@app/common/dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  CAMPAIGN_DELTA_EVENT_CONSUMED_LOG,
  SEGMENT_CAMPAIGN_DELTA_EVENT,
  SEGMENT_UI_DELTA_EVENT,
  UI_DELTA_EVENT_CONSUMED_LOG,
} from '../constants/constants';
import { CreateSegmentDto } from '../dto/request';
import {
  SegmentDeltaResponseDto,
  SegmentMembersResponseDto,
  SegmentResponseDto,
} from '../dto/responses';
import { SegmentMembershipService, SegmentService } from '../services';

@Controller('segments')
export class SegmentController {
  private readonly logger = new Logger(SegmentController.name);

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
  tansactionCreatedEvent(@Payload() event: dto.TransactionCreatedEvent): void {
    return this.segmentMembershipService.transactionCreated(event);
  }

  @EventPattern(SEGMENT_UI_DELTA_EVENT)
  handleUiDeltaEvent(@Payload() event: unknown): void {
    this.logger.debug(UI_DELTA_EVENT_CONSUMED_LOG(JSON.stringify(event)));
  }

  @EventPattern(SEGMENT_CAMPAIGN_DELTA_EVENT)
  handleCampaignDeltaEvent(@Payload() event: unknown): void {
    this.logger.debug(CAMPAIGN_DELTA_EVENT_CONSUMED_LOG(JSON.stringify(event)));
  }
}
