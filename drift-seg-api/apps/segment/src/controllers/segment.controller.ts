import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedSegmentResponseDto } from '../dto/paginated-segment-response.dto';
import { CreateSegmentDto } from '../dto/request';
import {
  SegmentMembersResponseDto,
  SegmentResponseDto,
} from '../dto/responses';
import { SegmentMembershipService, SegmentService } from '../services';
import { SegmentQueryService } from '../services/segment-query.service';

@Controller('segments')
@ApiTags('segments')
export class SegmentController {
  private readonly logger = new Logger(SegmentController.name);

  constructor(
    private readonly segmentService: SegmentService,
    private readonly segmentMembershipService: SegmentMembershipService,
    private readonly segmentQueryService: SegmentQueryService,
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
  getMembers(@Param('id') id: string): Promise<SegmentMembersResponseDto> {
    return this.segmentService.getSegmentMembers(id);
  }

  // @Get(':id/deltas')
  // @ApiOkResponse({ type: SegmentDeltaResponseDto, isArray: true })
  // getDeltas(@Param('id') id: string): Promise<SegmentDeltaResponseDto[]> {
  //   return this.segmentService.getSegmentDeltas(id);
  // }

  @Post('create')
  @ApiBody({ type: CreateSegmentDto })
  @ApiCreatedResponse({ type: SegmentResponseDto })
  create(@Body() payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    return this.segmentService.createSegment(payload);
  }

  // @Post(':id/refresh')
  // @ApiOkResponse({
  //   schema: {
  //     type: 'object',
  //     properties: { refreshed: { type: 'boolean', example: true } },
  //   },
  // })
  // async refreshStatic(@Param('id') id: string): Promise<{ refreshed: true }> {
  //   await this.segmentService.refreshStaticSegment(id);
  //   return { refreshed: true };
  // }

  // @Delete(':id')
  // @ApiOkResponse({
  //   schema: {
  //     type: 'object',
  //     properties: { deleted: { type: 'boolean', example: true } },
  //   },
  // })
  // async deleteWithDependents(
  //   @Param('id') id: string,
  // ): Promise<{ deleted: true }> {
  //   await this.segmentService.deleteSegmentCascade(id);
  //   return { deleted: true };
  // }

  // @EventPattern(dto.TRANSACTION_CREATED_EVENT)
  // tansactionCreatedEvent(
  //   @Payload() event: dto.TransactionCreatedEvent,
  // ): Promise<void> {
  //   return this.segmentMembershipService.transactionCreated(event);
  // }

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
