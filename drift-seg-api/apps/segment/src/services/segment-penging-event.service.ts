import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import {
  FAILED_TO_PARSE_PENDING_TRIGGER_LOG,
  REDIS_CLIENT_ERROR_LOG,
  REDIS_CLIENT_EVENT,
  REDIS_CLIENT_STATUS,
  SEGMENT_PENDING_EVENTS_REDIS_HASH_KEY,
  SEGMENT_PENDING_EVENTS_REDIS_INDEX_KEY,
} from '../constants/constants';
import { SEGMENT_REDIS_CLIENT } from '../constants/tokens';
import {
  PendingBatchEntry,
  PendingTrigger,
} from '../models/interfaces/segment.interface';

@Injectable()
export class SegmentPendingEventQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(SegmentPendingEventQueueService.name);

  constructor(
    @Inject(SEGMENT_REDIS_CLIENT)
    private readonly redisClient: Redis,
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
    const date = Date.now();
    const triggerValue = JSON.stringify(trigger);
    await this.redisClient
      .multi()
      .hset(SEGMENT_PENDING_EVENTS_REDIS_HASH_KEY, customerId, triggerValue)
      .zadd(SEGMENT_PENDING_EVENTS_REDIS_INDEX_KEY, date, customerId)
      .exec();
  }

  async pendingBatch(limit: number): Promise<PendingBatchEntry[]> {
    await this.ensureRedisConnected();
    const customerIds = await this.redisClient.zrange(
      SEGMENT_PENDING_EVENTS_REDIS_INDEX_KEY,
      0,
      Math.max(0, limit - 1),
    );
    if (customerIds.length === 0) {
      return [];
    }

    const triggersRaw = await this.redisClient.hmget(
      SEGMENT_PENDING_EVENTS_REDIS_HASH_KEY,
      ...customerIds,
    );

    await this.redisClient
      .multi()
      .zrem(SEGMENT_PENDING_EVENTS_REDIS_INDEX_KEY, ...customerIds)
      .hdel(SEGMENT_PENDING_EVENTS_REDIS_HASH_KEY, ...customerIds)
      .exec();

    return this.mapCustomerIdsToPendingBatch(customerIds, triggersRaw);
  }

  async getPendingCount(): Promise<number> {
    await this.ensureRedisConnected();
    return this.redisClient.zcard(SEGMENT_PENDING_EVENTS_REDIS_INDEX_KEY);
  }

  private mapCustomerIdsToPendingBatch(
    customerIds: string[],
    triggersRaw: (string | null)[],
  ): PendingBatchEntry[] {
    return customerIds.flatMap((customerId, index) => {
      const raw = triggersRaw[index];
      if (!raw) {
        return [];
      }

      return this.parsePendingBatchEntry(customerId, raw);
    });
  }

  private parsePendingBatchEntry(
    customerId: string,
    rawTrigger: string,
  ): PendingBatchEntry[] {
    try {
      return [
        { customerId, trigger: JSON.parse(rawTrigger) as PendingTrigger },
      ];
    } catch {
      this.logger.warn(FAILED_TO_PARSE_PENDING_TRIGGER_LOG(customerId));
      return [];
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient.status !== REDIS_CLIENT_STATUS.END) {
      await this.redisClient.quit().catch(() => undefined);
    }
  }
}
