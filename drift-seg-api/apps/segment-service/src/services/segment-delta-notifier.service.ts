import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  SEGMENT_CAMPAIGN_DELTA_EVENT,
  SEGMENT_UI_DELTA_EVENT,
} from '../constants/constants';
import { SegmentDeltaRepository } from '../repositories';
import { SegmentSearchIndexerService } from './segment-search-indexer.service';

@Injectable()
export class SegmentDeltaNotifierService {
  constructor(
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly segmentSearchIndexerService: SegmentSearchIndexerService,
    @Inject('SEGMENT_NOTIFICATIONS_CLIENT')
    private readonly notificationsClient: ClientProxy,
  ) {}

  async publishAggregatedDeltaChangesByTriggerEventIds(
    triggerEventIds: string[],
  ): Promise<void> {
    const deltas = await this.segmentDeltaRepository.findByTriggerEventIds(
      triggerEventIds,
    );
    const grouped = new Map<
      string,
      {
        segmentId: string;
        segmentkind: string;
        addedCustomerIds: Set<string>;
        removedCustomerIds: Set<string>;
      }
    >();

    for (const delta of deltas) {
      const key = delta.segmentId.toString();
      const item = grouped.get(key) ?? {
        segmentId: key,
        segmentkind: delta.segmentkind,
        addedCustomerIds: new Set<string>(),
        removedCustomerIds: new Set<string>(),
      };

      for (const customerId of delta.addedCustomerIds ?? []) {
        item.addedCustomerIds.add(customerId.toString());
      }
      for (const customerId of delta.removedCustomerIds ?? []) {
        item.removedCustomerIds.add(customerId.toString());
      }
      grouped.set(key, item);
    }

    for (const item of grouped.values()) {
      const payload = {
        eventId: `delta-${item.segmentId}-${new Date().toISOString()}`,
        eventType: SEGMENT_UI_DELTA_EVENT,
        segmentId: item.segmentId,
        segmentkind: item.segmentkind,
        addedCustomerIds: Array.from(item.addedCustomerIds),
        removedCustomerIds: Array.from(item.removedCustomerIds),
        occurredAt: new Date().toISOString(),
      };

      this.notificationsClient.emit(SEGMENT_UI_DELTA_EVENT, payload);
      this.notificationsClient.emit(SEGMENT_CAMPAIGN_DELTA_EVENT, {
        ...payload,
        eventType: SEGMENT_CAMPAIGN_DELTA_EVENT,
      });

      await this.segmentSearchIndexerService.indexBatchRecomputeEvent({
        eventId: payload.eventId,
        eventType: 'segment.delta.aggregated',
        processedCustomers:
          payload.addedCustomerIds.length + payload.removedCustomerIds.length,
        customerMongoIds: [
          ...payload.addedCustomerIds,
          ...payload.removedCustomerIds,
        ],
        pendingCustomers: 0,
        occurredAt: payload.occurredAt,
      });
    }
  }
}
