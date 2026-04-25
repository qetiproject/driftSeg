import { Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Types } from 'mongoose';
import {
  PROCESSED_MEMBERSHIP_BATCH_LOG,
  SEGMENT_BATCH_EVENT_ID_PREFIX,
  SEGMENT_BATCH_RECOMPUTE_EVENT,
} from '../../constants/constants';
import {
  BatchRecomputePayload,
  PendingBatchEntry,
} from '../../models/interfaces/segment.interface';
import { SegmentMembershipFacade } from '../../services/facades/segment-membership.facade';
import { SegmentDeltaNotifierService } from '../../services/segment-delta-notifier.service';
import { SegmentSearchIndexerService } from '../../services/segment-search-indexer.service';

export async function recomputeMembershipForPendingBatch(
  pendingBatch: PendingBatchEntry[],
  segmentMembershipFacade: SegmentMembershipFacade,
): Promise<void> {
  for (const { customerId, trigger } of pendingBatch) {
    await segmentMembershipFacade.recomputeMembershipForCustomer(
      new Types.ObjectId(customerId),
      trigger,
    );
  }
}

export function buildBatchRecomputePayload(
  pendingBatch: PendingBatchEntry[],
  pendingCustomers: number,
): BatchRecomputePayload {
  const occurredAt = new Date().toISOString();
  return {
    eventId: `${SEGMENT_BATCH_EVENT_ID_PREFIX}-${occurredAt}`,
    eventType: SEGMENT_BATCH_RECOMPUTE_EVENT,
    processedCustomers: pendingBatch.length,
    customerIds: pendingBatch.map(({ customerId }) => customerId),
    pendingCustomers,
    occurredAt,
  };
}

export async function publishBatchSideEffects(
  pendingBatch: PendingBatchEntry[],
  payload: BatchRecomputePayload,
  deps: {
    notificationsClient: ClientProxy;
    segmentSearchIndexerService: SegmentSearchIndexerService;
    segmentDeltaNotifierService: SegmentDeltaNotifierService;
  },
): Promise<void> {
  deps.notificationsClient.emit(SEGMENT_BATCH_RECOMPUTE_EVENT, payload);
  await deps.segmentSearchIndexerService.indexBatchRecomputeEvent(payload);
  await deps.segmentDeltaNotifierService.publishAggregatedDeltaChangesByTriggerEventIds(
    pendingBatch.map(({ trigger }) => trigger.eventId),
  );
}

export function logProcessedBatch(
  logger: Logger,
  processedCustomers: number,
  pendingCustomers: number,
): void {
  logger.log(
    PROCESSED_MEMBERSHIP_BATCH_LOG(processedCustomers, pendingCustomers),
  );
}
