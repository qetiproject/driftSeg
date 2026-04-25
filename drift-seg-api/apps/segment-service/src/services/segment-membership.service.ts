import {
  TRANSACTION_CREATED_EVENT,
  type TransactionCreatedEvent,
} from '@app/common/dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SEGMENT_EVENT_BATCH_SIZE } from '../constants/constants';
import { SEGMENT_NOTIFICATIONS_CLIENT } from '../constants/tokens';
import { SegmentDocument } from '../models';
import { CustomerActivityRepository } from '../repositories';
import {
  buildSchedulerTrigger,
  buildStaticRefreshTrigger,
} from '../utils/helper/segment-membership.helper';
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
    await publishBatchSideEffects(pendingBatch, payload, {
      notificationsClient: this.notificationsClient,
      segmentSearchIndexerService: this.segmentSearchIndexerService,
      segmentDeltaNotifierService: this.segmentDeltaNotifierService,
    });
    logProcessedBatch(this.logger, pendingBatch.length, pendingCustomers);
  }

  async recomputeAllDynamicMemberships(): Promise<void> {
    const customerIds =
      await this.customerActivityRepository.getDistinctCustomerIdsWithTransactions();

    for (const customerId of customerIds) {
      await this.segmentMembershipFacade.recomputeMembershipForCustomer(
        customerId,
        buildSchedulerTrigger(customerId),
      );
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
      buildStaticRefreshTrigger(String(segment._id)),
    );
  }
}
