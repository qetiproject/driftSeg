import type { TransactionCreatedEvent } from '@app/common/dto/transaction-created.event';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TRANSACTION_CREATED_EVENT } from '@segment/constants/constants';
import { PaginatedSegmentResponseDto } from '@segment/dto/paginated-segment-response.dto';
import { CreateSegmentDto } from '@segment/dto/request/create-segment.dto';
import {
  SegmentDeltaResponseDto,
  SegmentMembersResponseDto,
  SegmentResponseDto,
} from '@segment/dto/responses/index';
import { SegmentCommandService } from '@segment/services/segment methods/segment-command.service';
import { SegmentQueryService } from '@segment/services/segment methods/segment-query.service';
import { SegmentMembershipService } from '@segment/services/segment-membership.service';

@Controller('segments')
@ApiTags('segments')
export class SegmentController {
  constructor(
    private readonly segmentCommandService: SegmentCommandService,
    private readonly segmentQueryService: SegmentQueryService,
    private readonly segmentMembershipService: SegmentMembershipService,
  ) {}

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Limit items',
  })
  @ApiOkResponse({ type: PaginatedSegmentResponseDto })
  getSegments(): Promise<PaginatedSegmentResponseDto> {
    return this.segmentQueryService.getSegments();
  }

  @Get(':id/members')
  @ApiOkResponse({ type: SegmentMembersResponseDto })
  getSegmentWithMembers(
    @Param('id') id: string,
  ): Promise<SegmentMembersResponseDto> {
    return this.segmentQueryService.getSegmentWithMembers(id);
  }

  @Get(':id/deltas')
  @ApiOkResponse({ type: SegmentDeltaResponseDto, isArray: true })
  getSegmentDeltas(
    @Param('id') id: string,
  ): Promise<SegmentDeltaResponseDto[]> {
    return this.segmentQueryService.getSegmentDeltas(id);
  }

  @Post('create')
  @ApiBody({ type: CreateSegmentDto })
  @ApiCreatedResponse({ type: SegmentResponseDto })
  create(@Body() payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    return this.segmentCommandService.createSegment(payload);
  }

  @Post(':id/refresh')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { refreshed: { type: 'boolean', example: true } },
    },
  })
  async refreshStatic(@Param('id') id: string): Promise<{ refreshed: true }> {
    await this.segmentCommandService.refreshStaticSegmentById(id);
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
    await this.segmentCommandService.deleteSegmentCascade(id);
    return { deleted: true };
  }

  @EventPattern(TRANSACTION_CREATED_EVENT)
  tansactionCreatedEvent(
    @Payload() event: TransactionCreatedEvent,
  ): Promise<void> {
    return this.segmentMembershipService.transactionCreated(event);
  }

  // @EventPattern(SEGMENT_UI_DELTA_EVENT)
  // handleUiDeltaEvent(@Payload() event: unknown): void {
  //   this.logger.debug(UI_DELTA_EVENT_CONSUMED_LOG(JSON.stringify(event)));
  // }

  // @EventPattern(SEGMENT_BATCH_RECOMPUTE_EVENT)
  // handleBatchRecomputeEvent(
  //   @Payload()
  //   event: {
  //     processedCustomers?: number;
  //     pendingCustomers?: number;
  //   },
  // ): void {
  //   this.logger.debug(
  //     PROCESSED_MEMBERSHIP_BATCH_LOG(
  //       event.processedCustomers ?? 0,
  //       event.pendingCustomers ?? 0,
  //     ),
  //   );
  // }

  // @EventPattern(SEGMENT_CAMPAIGN_DELTA_EVENT)
  // handleCampaignDeltaEvent(@Payload() event: unknown): void {
  //   this.logger.debug(CAMPAIGN_DELTA_EVENT_CONSUMED_LOG(JSON.stringify(event)));
  // }
}
