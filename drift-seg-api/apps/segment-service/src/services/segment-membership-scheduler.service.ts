import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SegmentMembershipService } from './segment-membership.service';

@Injectable()
export class SegmentMembershipSchedulerService {
  private readonly logger = new Logger(SegmentMembershipSchedulerService.name);

  constructor(private readonly segmentMembershipService: SegmentMembershipService) {}

  @Cron('*/1 * * * *')
  async recomputeDynamicSegments(): Promise<void> {
    this.logger.debug('Running scheduled segment membership recompute');
    await this.segmentMembershipService.recomputeAllDynamicMemberships();
  }
}
