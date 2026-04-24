import { Injectable, OnModuleDestroy } from '@nestjs/common';

interface PendingTrigger {
  eventId: string;
  eventType: string;
}

@Injectable()
export class SegmentEventBufferService implements OnModuleDestroy {
  private readonly pendingEventMap = new Map<string, PendingTrigger>();

  async upsertPendingEvent(
    customerMongoId: string,
    trigger: PendingTrigger,
  ): Promise<void> {
    this.pendingEventMap.set(customerMongoId, trigger);
  }

  async takePendingBatch(
    limit: number,
  ): Promise<Array<{ customerMongoId: string; trigger: PendingTrigger }>> {
    const entries = Array.from(this.pendingEventMap.entries()).slice(0, limit);
    if (entries.length === 0) {
      return [];
    }

    for (const [customerMongoId] of entries) {
      this.pendingEventMap.delete(customerMongoId);
    }

    return entries.map(([customerMongoId, trigger]) => ({
      customerMongoId,
      trigger,
    }));
  }

  async pendingSize(): Promise<number> {
    return this.pendingEventMap.size;
  }

  async onModuleDestroy(): Promise<void> {}
}
