import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface PendingTrigger {
  eventId: string;
  eventType: string;
}

const PENDING_EVENTS_KEY = 'segment:pending:transaction-events';

@Injectable()
export class SegmentEventBufferService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(this.configService.getOrThrow<string>('REDIS_URL'));
  }

  async upsertPendingEvent(
    customerMongoId: string,
    trigger: PendingTrigger,
  ): Promise<void> {
    await this.redis.hset(
      PENDING_EVENTS_KEY,
      customerMongoId,
      JSON.stringify(trigger),
    );
  }

  async takePendingBatch(
    limit: number,
  ): Promise<Array<{ customerMongoId: string; trigger: PendingTrigger }>> {
    const eventMap = await this.redis.hgetall(PENDING_EVENTS_KEY);
    const entries = Object.entries(eventMap).slice(0, limit);
    if (entries.length === 0) {
      return [];
    }

    const customerMongoIds = entries.map(
      ([customerMongoId]) => customerMongoId,
    );
    await this.redis.hdel(PENDING_EVENTS_KEY, ...customerMongoIds);

    return entries
      .map(([customerMongoId, rawTrigger]) => {
        try {
          return {
            customerMongoId,
            trigger: JSON.parse(rawTrigger) as PendingTrigger,
          };
        } catch {
          return null;
        }
      })
      .filter(
        (
          entry,
        ): entry is { customerMongoId: string; trigger: PendingTrigger } =>
          entry !== null,
      );
  }

  async pendingSize(): Promise<number> {
    return this.redis.hlen(PENDING_EVENTS_KEY);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
