import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  SEGMENT_CAMPAIGN_DELTA_EVENT,
  SEGMENT_UI_DELTA_EVENT,
} from '../constants/constants';
import { SEGMENT_NOTIFICATIONS_CLIENT } from '../constants/tokens';
import {
  AggregatedSegmentDelta,
  SegmentDeltaPayload,
} from '../models/interfaces/segment.interface';
import { SegmentDeltaRepository } from '../repositories';
import { SegmentSearchIndexerService } from './segment-search-indexer.service';

@Injectable()
export class SegmentDeltaNotifierService {
  private readonly AGGREGATED_DELTA_EVENT_TYPE = 'segment.delta.aggregated';

  constructor(
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly segmentSearchIndexerService: SegmentSearchIndexerService,
    @Inject(SEGMENT_NOTIFICATIONS_CLIENT)
    private readonly notificationsClient: ClientProxy,
  ) {}

  async publishAggregatedDeltaChangesByTriggerEventIds(
    triggerEventIds: string[],
  ): Promise<void> {
    const deltas = await this.loadDeltasByTriggerEventIds(triggerEventIds);
    const grouped = this.groupDeltasBySegment(deltas);

    for (const item of grouped.values()) {
      const payload = this.buildUiDeltaPayload(item);
      this.publishDeltaEvents(payload);
      await this.indexAggregatedDelta(payload);
    }
  }

  private async loadDeltasByTriggerEventIds(
    triggerEventIds: string[],
  ): Promise<
    Awaited<ReturnType<SegmentDeltaRepository['findByTriggerEventIds']>>
  > {
    return this.segmentDeltaRepository.findByTriggerEventIds(triggerEventIds);
  }

  private groupDeltasBySegment(
    deltas: Awaited<
      ReturnType<SegmentDeltaRepository['findByTriggerEventIds']>
    >,
  ): Map<string, AggregatedSegmentDelta> {
    const grouped = new Map<string, AggregatedSegmentDelta>();

    for (const delta of deltas) {
      const segmentId = delta.segmentId.toString();
      const item = grouped.get(segmentId) ?? {
        segmentId,
        segmentkind: delta.segmentkind,
        addedCustomerIds: new Set<string>(),
        removedCustomerIds: new Set<string>(),
      };

      this.mergeDeltaCustomerIds(item, delta);
      grouped.set(segmentId, item);
    }

    return grouped;
  }

  private mergeDeltaCustomerIds(
    item: AggregatedSegmentDelta,
    delta: Awaited<
      ReturnType<SegmentDeltaRepository['findByTriggerEventIds']>
    >[number],
  ): void {
    for (const customerId of delta.addedCustomerIds ?? []) {
      item.addedCustomerIds.add(customerId.toString());
    }

    for (const customerId of delta.removedCustomerIds ?? []) {
      item.removedCustomerIds.add(customerId.toString());
    }
  }

  private buildUiDeltaPayload(
    item: AggregatedSegmentDelta,
  ): SegmentDeltaPayload {
    const occurredAt = new Date().toISOString();
    return {
      eventId: `delta-${item.segmentId}-${occurredAt}`,
      eventType: SEGMENT_UI_DELTA_EVENT,
      segmentId: item.segmentId,
      segmentkind: item.segmentkind,
      addedCustomerIds: Array.from(item.addedCustomerIds),
      removedCustomerIds: Array.from(item.removedCustomerIds),
      occurredAt,
    };
  }

  private publishDeltaEvents(payload: SegmentDeltaPayload): void {
    this.notificationsClient.emit(SEGMENT_UI_DELTA_EVENT, payload);
    this.notificationsClient.emit(SEGMENT_CAMPAIGN_DELTA_EVENT, {
      ...payload,
      eventType: SEGMENT_CAMPAIGN_DELTA_EVENT,
    });
  }

  private async indexAggregatedDelta(
    payload: SegmentDeltaPayload,
  ): Promise<void> {
    await this.segmentSearchIndexerService.indexBatchRecomputeEvent({
      eventId: payload.eventId,
      eventType: this.AGGREGATED_DELTA_EVENT_TYPE,
      processedCustomers:
        payload.addedCustomerIds.length + payload.removedCustomerIds.length,
      customerIds: [...payload.addedCustomerIds, ...payload.removedCustomerIds],
      pendingCustomers: 0,
      occurredAt: payload.occurredAt,
    });
  }
}
