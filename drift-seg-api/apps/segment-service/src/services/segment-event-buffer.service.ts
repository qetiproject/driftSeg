import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PendingTrigger } from '../models/interfaces/segment.interface';

@Injectable()
export class SegmentEventBufferService implements OnModuleDestroy {
  private readonly pendingEventMap = new Map<string, PendingTrigger>();

  setPendingEvent(customerId: string, trigger: PendingTrigger): void {
    this.pendingEventMap.set(customerId, trigger);
  }

  takePendingBatch(
    limit: number,
  ): Array<{ customerId: string; trigger: PendingTrigger }> {
    const entries = Array.from(this.pendingEventMap.entries()).slice(0, limit);
    if (entries.length === 0) {
      return [];
    }

    for (const [customerId] of entries) {
      this.pendingEventMap.delete(customerId);
    }

    return entries.map(([customerId, trigger]) => ({
      customerId,
      trigger,
    }));
  }

  pendingSize(): number {
    return this.pendingEventMap.size;
  }

  async onModuleDestroy(): Promise<void> {}
}
