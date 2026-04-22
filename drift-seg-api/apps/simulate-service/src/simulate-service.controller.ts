import { Body, Controller, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { SegmentService } from '../../segment-service/src/services/segment.service';

@Controller('simulation')
export class SimulationController {
  constructor(private readonly segmentService: SegmentService) {}

  @Post('seed/demo-segments')
  seedDemoSegments() {
    return this.segmentService.seedDemoSegments();
  }

  @Post('events/transaction')
  ingestTransactionEvent(
    @Body() payload: { customerId: string; amount: number; at?: string },
  ) {
    return this.segmentService.ingestTransactionEvent(payload);
  }

  @Post('events/profile-update')
  ingestProfileUpdateEvent(
    @Body() payload: { customerId: string; patch: Record<string, unknown> },
  ) {
    return this.segmentService.ingestProfileUpdateEvent(payload);
  }

  @Post('clock/advance-days')
  advanceSimulationClock(@Body() payload: { days: number }) {
    return this.segmentService.simulateTimeAdvance(payload.days);
  }

  @Post('events/import-transactions')
  importTransactionEvents(
    @Body()
    payload: { transactions: Array<{ customerId: string; amount: number; at?: string }> },
    @Query('chunkSize', new ParseIntPipe({ optional: true })) chunkSize?: number,
  ) {
    return this.segmentService.importTransactionsInChunks(
      payload.transactions,
      chunkSize ?? 1000,
    );
  }

  @Post('recompute/dynamic-segments')
  recomputeDynamicSegments(
    @Body() payload: { reason?: 'time_advanced' | 'profile_updated' | 'bulk_import' },
  ) {
    return this.segmentService.recomputeDynamicSegments(
      payload.reason ?? 'profile_updated',
    );
  }

  @Get('signals/ui-deltas')
  pullUiDeltaSignals() {
    return this.segmentService.pullUiDeltaSignals();
  }

  @Get('signals/background-deltas')
  pullBackgroundDeltaSignals() {
    return this.segmentService.pullBackgroundDeltaSignals();
  }
}
