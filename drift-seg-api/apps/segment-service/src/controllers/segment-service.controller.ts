import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSegmentDto, UpdateSegmentDto } from '../dto';
import { SegmentService } from '../services/segment.service';

@Controller('segments')
export class SegmentServiceController {
  constructor(private readonly segmentService: SegmentService) {}

  @Post()
  create(@Body() payload: CreateSegmentDto) {
    return this.segmentService.createSegment(payload);
  }

  @Get()
  list() {
    return this.segmentService.listSegments();
  }

  @Get(':segmentId/memberships')
  memberships(@Param('segmentId') segmentId: string) {
    return this.segmentService.listSegmentMemberships(segmentId);
  }

  @Get(':segmentId/deltas')
  deltas(@Param('segmentId') segmentId: string) {
    return this.segmentService.listSegmentDeltas(segmentId);
  }

  @Patch(':segmentId')
  update(
    @Param('segmentId') segmentId: string,
    @Body() payload: UpdateSegmentDto,
  ) {
    return this.segmentService.updateSegment(segmentId, payload);
  }

  @Delete(':segmentId')
  remove(@Param('segmentId') segmentId: string) {
    return this.segmentService.removeSegment(segmentId);
  }

  @Post(':segmentId/refresh')
  manualRefresh(@Param('segmentId') segmentId: string) {
    return this.segmentService.manualRefreshSegment(segmentId);
  }

  @Post('simulate/transaction')
  simulateTransaction(
    @Body() payload: { customerId: string; amount: number; at?: string },
  ) {
    return this.segmentService.addTransaction(payload);
  }

  @Post('simulate/profile')
  simulateProfileUpdate(
    @Body() payload: { customerId: string; patch: Record<string, unknown> },
  ) {
    return this.segmentService.updateProfile(payload);
  }

  @Post('simulate/time/advance')
  simulateTimeAdvance(@Body() payload: { days: number }) {
    return this.segmentService.advanceTime(payload.days);
  }

  @Post('simulate/import')
  simulateImport(
    @Body()
    payload: { transactions: Array<{ customerId: string; amount: number; at?: string }> },
    @Query('chunkSize', new ParseIntPipe({ optional: true })) chunkSize?: number,
  ) {
    return this.segmentService.importTransactions(
      payload.transactions,
      chunkSize ?? 1000,
    );
  }

  @Post('recompute')
  recomputeAll(
    @Body() payload: { reason?: 'time_advanced' | 'profile_updated' | 'bulk_import' },
  ) {
    return this.segmentService.recomputeAll(payload.reason ?? 'profile_updated');
  }

  @Post('simulate/bootstrap')
  bootstrapSimulation() {
    return this.segmentService.bootstrapDemoSegments();
  }

  @Get('signals/ui')
  uiSignals() {
    return this.segmentService.pullUiSignals();
  }

  @Get('signals/background')
  backgroundSignals() {
    return this.segmentService.pullBackgroundSignals();
  }
}
