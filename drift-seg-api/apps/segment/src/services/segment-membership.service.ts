import { type TransactionCreatedEvent } from '@app/common/dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  SEGMENT_EVENT_BATCH_SIZE,
  TRANSACTION_CREATED_EVENT,
} from '../constants/constants';
import { SEGMENT_NOTIFICATIONS_CLIENT } from '../constants/tokens';
import { SegmentDocument } from '../models';
import { CustomerActivityRepository } from '../repositories';
import {
  buildSchedulerTrigger,
  buildStaticRefreshTrigger,
} from '../utils/segment-membership.helper';
import {
  buildBatchRecomputePayload,
  logProcessedBatch,
  publishBatchSideEffects,
  recomputeMembershipForPendingBatch,
} from '../utils/transaction-event.helper';
import { SegmentDeltaNotifierService } from './segment-delta-notifier.service';
import { SegmentMembershipFacade } from './segment-membership.facade';
import { SegmentPendingEventQueueService } from './segment-penging-event.service';
import { SegmentSearchIndexerService } from './segment-search-indexer.service';

@Injectable()
export class SegmentMembershipService {
  private readonly logger = new Logger(SegmentMembershipService.name);

  constructor(
    private readonly customerActivityRepository: CustomerActivityRepository,
    private readonly segmentMembershipFacade: SegmentMembershipFacade,
    private readonly segmentPendingEventQueueService: SegmentPendingEventQueueService,
    private readonly segmentDeltaNotifierService: SegmentDeltaNotifierService,
    private readonly segmentSearchIndexerService: SegmentSearchIndexerService,
    @Inject(SEGMENT_NOTIFICATIONS_CLIENT)
    private readonly notificationsClient: ClientProxy,
  ) {}

  async transactionCreated(event: TransactionCreatedEvent): Promise<void> {
    if (event.eventType !== TRANSACTION_CREATED_EVENT) {
      return;
    }

    await this.segmentPendingEventQueueService.addPendingEvent(
      event.data.customerId,
      {
        eventId: event.eventId,
        eventType: event.eventType,
      },
    );
  }

  async recomputeMembershipsForPendingTransactionBatch(): Promise<void> {
    const pendingBatch =
      await this.segmentPendingEventQueueService.pendingBatch(
        SEGMENT_EVENT_BATCH_SIZE,
      );
    if (pendingBatch.length === 0) {
      return;
    }

    await recomputeMembershipForPendingBatch(
      pendingBatch,
      this.segmentMembershipFacade,
    );
    const pendingCustomers =
      await this.segmentPendingEventQueueService.getPendingCount();
    const payload = buildBatchRecomputePayload(pendingBatch, pendingCustomers);
    await publishBatchSideEffects(pendingBatch, payload, {
      notificationsClient: this.notificationsClient,
      segmentSearchIndexerService: this.segmentSearchIndexerService,
      segmentDeltaNotifierService: this.segmentDeltaNotifierService,
    });
    await this.segmentPendingEventQueueService.removePendingEvents(
      pendingBatch.map(({ customerId }) => customerId),
    );
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

  // refreshStaticSegmentMemberships
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
