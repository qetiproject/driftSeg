import {
  TRANSACTION_CREATED_EVENT,
  type TransactionCreatedEvent,
} from '@app/common/dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Types } from 'mongoose';
import {
  SEGMENT_BATCH_RECOMPUTE_EVENT,
  SEGMENT_EVENT_BATCH_SIZE,
  SEGMENT_RECOMPUTE_CHUNK_SIZE,
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
    const entries = this.segmentEventBufferService.takePendingBatch(
      SEGMENT_EVENT_BATCH_SIZE,
    );
    if (entries.length === 0) {
      return;
    }

    for (const { customerId, trigger } of entries) {
      await this.segmentMembershipFacade.recomputeMembershipForCustomer(
        new Types.ObjectId(customerId),
        trigger,
      );
    }

    const pendingCustomers = this.segmentEventBufferService.pendingSize();
    const payload = {
      eventId: `batch-${new Date().toISOString()}`,
      eventType: SEGMENT_BATCH_RECOMPUTE_EVENT,
      processedCustomers: entries.length,
      customerIds: entries.map(({ customerId }) => customerId),
      pendingCustomers,
      occurredAt: new Date().toISOString(),
    };
    this.notificationsClient.emit(SEGMENT_BATCH_RECOMPUTE_EVENT, payload);
    await this.segmentSearchIndexerService.indexBatchRecomputeEvent(payload);
    await this.segmentDeltaNotifierService.publishAggregatedDeltaChangesByTriggerEventIds(
      entries.map(({ trigger }) => trigger.eventId),
    );

    this.logger.log(
      `Processed membership batch size=${entries.length}, pending=${pendingCustomers}`,
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
        eventId: `segment-static-refresh-${segment._id.toString()}-${new Date().toISOString()}`,
        eventType: 'segment.static.manual_refresh',
      },
    );
  }
}
