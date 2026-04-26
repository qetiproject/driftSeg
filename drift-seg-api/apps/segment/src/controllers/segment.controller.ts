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
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CAMPAIGN_DELTA_EVENT_CONSUMED_LOG,
  PROCESSED_MEMBERSHIP_BATCH_LOG,
  SEGMENT_BATCH_RECOMPUTE_EVENT,
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
@ApiTags('segments')
export class SegmentController {
  private readonly logger = new Logger(SegmentController.name);

  constructor(
    private readonly segmentService: SegmentService,
    private readonly segmentMembershipService: SegmentMembershipService,
  ) {}

  @Get()
  @ApiOkResponse({ type: SegmentResponseDto, isArray: true })
  getAll(): Promise<SegmentResponseDto[]> {
    return this.segmentService.getAllSegments();
  }

  @Get(':id/members')
  @ApiOkResponse({ type: SegmentMembersResponseDto })
  getMembers(@Param('id') id: string): Promise<SegmentMembersResponseDto> {
    return this.segmentService.getSegmentMembers(id);
  }

  @Get(':id/deltas')
  @ApiOkResponse({ type: SegmentDeltaResponseDto, isArray: true })
  getDeltas(@Param('id') id: string): Promise<SegmentDeltaResponseDto[]> {
    return this.segmentService.getSegmentDeltas(id);
  }

  @Post()
  @ApiBody({ type: CreateSegmentDto })
  @ApiCreatedResponse({ type: SegmentResponseDto })
  create(@Body() payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    return this.segmentService.createSegment(payload);
  }

  @Post(':id/refresh')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { refreshed: { type: 'boolean', example: true } },
    },
  })
  async refreshStatic(@Param('id') id: string): Promise<{ refreshed: true }> {
    await this.segmentService.refreshStaticSegment(id);
    return { refreshed: true };
  }

  @Delete(':id')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { deleted: { type: 'boolean', example: true } },
    },
  })
  async deleteWithDependents(
    @Param('id') id: string,
  ): Promise<{ deleted: true }> {
    await this.segmentService.deleteSegmentCascade(id);
    return { deleted: true };
  }

  @EventPattern(dto.TRANSACTION_CREATED_EVENT)
  tansactionCreatedEvent(
    @Payload() event: dto.TransactionCreatedEvent,
  ): Promise<void> {
    return this.segmentMembershipService.transactionCreated(event);
  }

  @EventPattern(SEGMENT_UI_DELTA_EVENT)
  handleUiDeltaEvent(@Payload() event: unknown): void {
    this.logger.debug(UI_DELTA_EVENT_CONSUMED_LOG(JSON.stringify(event)));
  }

  @EventPattern(SEGMENT_BATCH_RECOMPUTE_EVENT)
  handleBatchRecomputeEvent(
    @Payload()
    event: {
      processedCustomers?: number;
      pendingCustomers?: number;
    },
  ): void {
    this.logger.debug(
      PROCESSED_MEMBERSHIP_BATCH_LOG(
        event.processedCustomers ?? 0,
        event.pendingCustomers ?? 0,
      ),
    );
  }

  @EventPattern(SEGMENT_CAMPAIGN_DELTA_EVENT)
  handleCampaignDeltaEvent(@Payload() event: unknown): void {
    this.logger.debug(CAMPAIGN_DELTA_EVENT_CONSUMED_LOG(JSON.stringify(event)));
  }
}
