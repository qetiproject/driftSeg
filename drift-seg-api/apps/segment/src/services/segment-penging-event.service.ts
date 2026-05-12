import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  REDIS_CLIENT_ERROR_LOG,
  REDIS_CLIENT_EVENT,
  REDIS_CLIENT_STATUS,
} from '@segment/constants/constants';
import { SEGMENT_REDIS_CLIENT } from '@segment/constants/tokens';
import {
  PendingBatchEntry,
  PendingTrigger,
} from '@segment/models/interfaces/segment.interface';
import { SegmentPendingEventsRepository } from '@segment/repositories/segment-pending-events.repository';
import Redis from 'ioredis';

@Injectable()
export class SegmentPendingEventQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(SegmentPendingEventQueueService.name);

  constructor(
    @Inject(SEGMENT_REDIS_CLIENT)
    private readonly redisClient: Redis,
    private readonly pendingEventsRepository: SegmentPendingEventsRepository,
  ) {
    this.redisClient.on(REDIS_CLIENT_EVENT.ERROR, (error: Error) => {
      this.logger.error(REDIS_CLIENT_ERROR_LOG(error.message));
    });
  }

  private async ensureRedisConnected(): Promise<void> {
    if (this.redisClient.status === REDIS_CLIENT_STATUS.WAIT) {
      await this.redisClient.connect();
    }
  }

  async addPendingEvent(
    customerId: string,
    trigger: PendingTrigger,
  ): Promise<void> {
    await this.ensureRedisConnected();
    await this.pendingEventsRepository.enqueuePendingTrigger(
      customerId,
      trigger,
    );
  }

  async pendingBatch(limit: number): Promise<PendingBatchEntry[]> {
    await this.ensureRedisConnected();
    return this.pendingEventsRepository.loadOldestPendingBatch(limit);
  }

  async removePendingEvents(customerIds: string[]): Promise<void> {
    await this.ensureRedisConnected();
    await this.pendingEventsRepository.removePendingForCustomers(customerIds);
  }

  async getPendingCount(): Promise<number> {
    await this.ensureRedisConnected();
    return this.pendingEventsRepository.countPendingCustomers();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient.status !== REDIS_CLIENT_STATUS.END) {
      await this.redisClient.quit().catch(() => undefined);
    }
  }
}
