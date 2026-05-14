import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Types } from 'mongoose';
import pLimit from 'p-limit';
import { SEGMENT_EVENT_BATCH_SIZE } from '../constants/constants';
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
import { SegmentMembershipFacade } from './facades/segment-membership.facade';
import { SegmentDeltaNotifierService } from './segment-delta-notifier.service';
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

  // recomputeAllDynamicMemberships
  async recomputeAllDynamicMemberships(): Promise<void> {
    const customerIds = await this.getActiveCustomerIds();

    const limit = pLimit(20);

    await Promise.all(
      customerIds.map((id) =>
        limit(() =>
          this.segmentMembershipFacade.recomputeMembershipForCustomer(
            id,
            buildSchedulerTrigger(id),
          ),
        ),
      ),
    );
  }

  getActiveCustomerIds(): Promise<Types.ObjectId[]> {
    return this.customerActivityRepository.getActiveCustomerIds();
  }

  // refreshStaticSegmentMemberships
  async refreshStaticSegmentMemberships(
    segment: SegmentDocument,
  ): Promise<void> {
    const customerIds = await this.getActiveCustomerIds();

    await this.segmentMembershipFacade.refreshStaticSegmentMemberships(
      segment,
      customerIds,
      buildStaticRefreshTrigger(String(segment._id)),
    );
  }
}
