import {
  TRANSACTION_CREATED_EVENT,
  type TransactionCreatedEvent,
} from '@app/common/dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Types } from 'mongoose';
import {
  PROCESSED_MEMBERSHIP_BATCH_LOG,
  SEGMENT_BATCH_EVENT_ID_PREFIX,
  SEGMENT_BATCH_RECOMPUTE_EVENT,
  SEGMENT_EVENT_BATCH_SIZE,
  SEGMENT_RECOMPUTE_CHUNK_SIZE,
  SEGMENT_STATIC_MANUAL_REFRESH_EVENT,
  SEGMENT_STATIC_REFRESH_EVENT_ID_PREFIX,
} from '../constants/constants';
import { SEGMENT_NOTIFICATIONS_CLIENT } from '../constants/tokens';
import { SegmentDocument } from '../models';
import { CustomerActivityRepository } from '../repositories';
import { buildSchedulerTrigger } from '../utils/helper/segment-membership.helper';
import { SegmentMembershipFacade } from './facades/segment-membership.facade';
import { SegmentDeltaNotifierService } from './segment-delta-notifier.service';
import { SegmentEventBufferService } from './segment-event-buffer.service';
import { SegmentSearchIndexerService } from './segment-search-indexer.service';

@Injectable()
export class SegmentMembershipService {
  private readonly logger = new Logger(SegmentMembershipService.name);

  constructor(
    private readonly customerActivityRepository: CustomerActivityRepository,
    private readonly segmentMembershipFacade: SegmentMembershipFacade,
    private readonly segmentEventBufferService: SegmentEventBufferService,
    private readonly segmentDeltaNotifierService: SegmentDeltaNotifierService,
    private readonly segmentSearchIndexerService: SegmentSearchIndexerService,
    @Inject(SEGMENT_NOTIFICATIONS_CLIENT)
    private readonly notificationsClient: ClientProxy,
  ) {}

  transactionCreated(event: TransactionCreatedEvent): void {
    if (event.eventType !== TRANSACTION_CREATED_EVENT) {
      return;
    }

    this.segmentEventBufferService.setPendingEvent(event.data.customerId, {
      eventId: event.eventId,
      eventType: event.eventType,
    });
  }

  async flushPendingTransactionEvents(): Promise<void> {
    const pendingBatch = this.segmentEventBufferService.takePendingBatch(
      SEGMENT_EVENT_BATCH_SIZE,
    );
    if (pendingBatch.length === 0) {
      return;
    }

    await this.recomputeMembershipForPendingBatch(pendingBatch);
    const pendingCustomers = this.segmentEventBufferService.pendingSize();
    const payload = this.buildBatchRecomputePayload(
      pendingBatch,
      pendingCustomers,
    );
    await this.publishBatchSideEffects(pendingBatch, payload);
    this.logProcessedBatch(pendingBatch.length, pendingCustomers);
  }

  private async recomputeMembershipForPendingBatch(
    pendingBatch: PendingBatchEntry[],
  ): Promise<void> {
    for (const { customerId, trigger } of pendingBatch) {
      await this.segmentMembershipFacade.recomputeMembershipForCustomer(
        new Types.ObjectId(customerId),
        trigger,
      );
    }
  }

  private buildBatchRecomputePayload(
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

  private async publishBatchSideEffects(
    pendingBatch: PendingBatchEntry[],
    payload: BatchRecomputePayload,
  ): Promise<void> {
    this.notificationsClient.emit(SEGMENT_BATCH_RECOMPUTE_EVENT, payload);
    await this.segmentSearchIndexerService.indexBatchRecomputeEvent(payload);
    await this.segmentDeltaNotifierService.publishAggregatedDeltaChangesByTriggerEventIds(
      pendingBatch.map(({ trigger }) => trigger.eventId),
    );
  }

  private logProcessedBatch(
    processedCustomers: number,
    pendingCustomers: number,
  ): void {
    this.logger.log(
      PROCESSED_MEMBERSHIP_BATCH_LOG(processedCustomers, pendingCustomers),
    );
  }

  async recomputeAllDynamicMemberships(): Promise<void> {
    const customerIds =
      await this.customerActivityRepository.getDistinctCustomerIdsWithTransactions();

    for (let i = 0; i < customerIds.length; i += SEGMENT_RECOMPUTE_CHUNK_SIZE) {
      const chunk = customerIds.slice(i, i + SEGMENT_RECOMPUTE_CHUNK_SIZE);
      for (const customerId of chunk) {
        await this.segmentMembershipFacade.recomputeMembershipForCustomer(
          customerId,
          buildSchedulerTrigger(customerId),
        );
      }
    }
  }

  async refreshStaticSegmentMemberships(
    segment: SegmentDocument,
  ): Promise<void> {
    const customerIds =
      await this.customerActivityRepository.getDistinctCustomerIdsWithTransactions();

    await this.segmentMembershipFacade.refreshStaticSegmentMemberships(
      segment,
      customerIds,
      {
        eventId: `${SEGMENT_STATIC_REFRESH_EVENT_ID_PREFIX}-${segment._id.toString()}-${new Date().toISOString()}`,
        eventType: SEGMENT_STATIC_MANUAL_REFRESH_EVENT,
      },
    );
  }
}

type PendingBatchEntry = ReturnType<
  SegmentEventBufferService['takePendingBatch']
>[number];

interface BatchRecomputePayload {
  eventId: string;
  eventType: string;
  processedCustomers: number;
  customerIds: string[];
  pendingCustomers: number;
  occurredAt: string;
}
