import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  SEGMENT_EVENT_FLUSH_CRON,
  SEGMENT_RECOMPUTE_CRON,
} from '../constants/constants';
import { SegmentMembershipService } from './segment-membership.service';

@Injectable()
export class SegmentMembershipSchedulerService {
  constructor(
    private readonly segmentMembershipService: SegmentMembershipService,
  ) {}

  @Cron(SEGMENT_RECOMPUTE_CRON)
  async handleDynamicSegmentMembershipRecompute(): Promise<void> {
    await this.segmentMembershipService.recomputeAllDynamicMemberships();
  }

  @Cron(SEGMENT_EVENT_FLUSH_CRON)
  async flushTransactionEventBatch(): Promise<void> {
    await this.segmentMembershipService.recomputeMembershipsForPendingTransactionBatch();
  }
}
