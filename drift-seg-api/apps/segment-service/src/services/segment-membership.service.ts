import {
  TRANSACTION_CREATED_EVENT,
  type TransactionCreatedEvent,
} from '@app/common/dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  SEGMENT_EVENT_BATCH_SIZE,
  SEGMENT_RECOMPUTE_CHUNK_SIZE,
  SEGMENT_STATIC_MANUAL_REFRESH_EVENT,
  SEGMENT_STATIC_REFRESH_EVENT_ID_PREFIX,
} from '../constants/constants';
import { SEGMENT_NOTIFICATIONS_CLIENT } from '../constants/tokens';
import { SegmentDocument } from '../models';
import { CustomerActivityRepository } from '../repositories';
import { buildSchedulerTrigger } from '../utils/helper/segment-membership.helper';
import {
  buildBatchRecomputePayload,
  logProcessedBatch,
  publishBatchSideEffects,
  recomputeMembershipForPendingBatch,
} from '../utils/helper/transaction-event.helper';
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

    await recomputeMembershipForPendingBatch(
      pendingBatch,
      this.segmentMembershipFacade,
    );
    const pendingCustomers = this.segmentEventBufferService.pendingSize();
    const payload = buildBatchRecomputePayload(pendingBatch, pendingCustomers);
    await publishBatchSideEffects(
      pendingBatch,
      payload,
      this.notificationsClient,
      this.segmentSearchIndexerService,
      this.segmentDeltaNotifierService,
    );
    logProcessedBatch(this.logger, pendingBatch.length, pendingCustomers);
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
