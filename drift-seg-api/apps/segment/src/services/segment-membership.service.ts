import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SEGMENT_EVENT_BATCH_SIZE } from '@segment/constants/constants';
import { SEGMENT_NOTIFICATIONS_CLIENT } from '@segment/constants/tokens';
import { SegmentDocument } from '@segment/models/segment.schema';
import { CustomerActivityRepository } from '@segment/repositories/customer-activity.repository';
import { SegmentDeltaNotifierService } from '@segment/services/segment-delta-notifier.service';
import { SegmentPendingEventQueueService } from '@segment/services/segment-penging-event.service';
import { SegmentSearchIndexerService } from '@segment/services/segment-search-indexer.service';
import {
  buildSchedulerTrigger,
  buildStaticRefreshTrigger,
} from '@segment/utils/segment-membership.helper';
import {
  buildBatchRecomputePayload,
  logProcessedBatch,
  publishBatchSideEffects,
  recomputeMembershipForPendingBatch,
} from '@segment/utils/transaction-event.helper';
import { Types } from 'mongoose';
import pLimit from 'p-limit';
import { SegmentMembershipFacade } from './facades/segment-membership.facade';

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
