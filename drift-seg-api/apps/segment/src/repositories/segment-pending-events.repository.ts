import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  FAILED_TO_PARSE_PENDING_TRIGGER_LOG,
  SEGMENT_PENDING_EVENTS_REDIS_HASH_KEY,
  SEGMENT_PENDING_EVENTS_REDIS_INDEX_KEY,
} from '@segment/constants/constants';
import { SEGMENT_REDIS_CLIENT } from '@segment/constants/tokens';
import {
  PendingBatchEntry,
  PendingTrigger,
} from '@segment/models/interfaces/segment.interface';
import Redis from 'ioredis';

@Injectable()
export class SegmentPendingEventsRepository {
  private readonly logger = new Logger(SegmentPendingEventsRepository.name);

  constructor(
    @Inject(SEGMENT_REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async enqueuePendingTrigger(
    customerId: string,
    trigger: PendingTrigger,
  ): Promise<void> {
    const markedAt = Date.now();
    const payload = JSON.stringify(trigger);
    await this.redis
      .multi()
      .hset(SEGMENT_PENDING_EVENTS_REDIS_HASH_KEY, customerId, payload)
      .zadd(SEGMENT_PENDING_EVENTS_REDIS_INDEX_KEY, markedAt, customerId)
      .exec();
  }

  async loadOldestPendingBatch(limit: number): Promise<PendingBatchEntry[]> {
    const customerIds = await this.redis.zrange(
      SEGMENT_PENDING_EVENTS_REDIS_INDEX_KEY,
      0,
      Math.max(0, limit - 1),
    );
    if (customerIds.length === 0) {
      return [];
    }

    const triggersRaw = await this.redis.hmget(
      SEGMENT_PENDING_EVENTS_REDIS_HASH_KEY,
      ...customerIds,
    );
    return this.mapIdsToBatchEntries(customerIds, triggersRaw);
  }

  async removePendingForCustomers(customerIds: string[]): Promise<void> {
    if (customerIds.length === 0) {
      return;
    }
    await this.redis
      .multi()
      .zrem(SEGMENT_PENDING_EVENTS_REDIS_INDEX_KEY, ...customerIds)
      .hdel(SEGMENT_PENDING_EVENTS_REDIS_HASH_KEY, ...customerIds)
      .exec();
  }

  async countPendingCustomers(): Promise<number> {
    return this.redis.zcard(SEGMENT_PENDING_EVENTS_REDIS_INDEX_KEY);
  }

  private mapIdsToBatchEntries(
    customerIds: string[],
    triggersRaw: (string | null)[],
  ): PendingBatchEntry[] {
    return customerIds.flatMap((customerId, index) => {
      const raw = triggersRaw[index];
      if (!raw) {
        return [];
      }
      return this.parseBatchEntryOrEmpty(customerId, raw);
    });
  }

  private parseBatchEntryOrEmpty(
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
}
