import {
  TRANSACTION_CREATED_EVENT,
  type TransactionCreatedEvent,
} from '@app/common/dto';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { SegmentDocument } from '../models';
import { CustomerActivityRepository } from '../repositories';
import { buildSchedulerTrigger } from '../utils/helper/segment-membership.helper';
import { SegmentMembershipFacade } from './facades/segment-membership.facade';

@Injectable()
export class SegmentMembershipService {
  constructor(
    private readonly customerActivityRepository: CustomerActivityRepository,
    private readonly segmentMembershipFacade: SegmentMembershipFacade,
  ) {}

  async processTransactionCreated(
    event: TransactionCreatedEvent,
  ): Promise<void> {
    if (event.eventType !== TRANSACTION_CREATED_EVENT) {
      return;
    }

    const customerObjectId = new Types.ObjectId(event.data.customerMongoId);
    await this.segmentMembershipFacade.recomputeMembershipForCustomer(
      customerObjectId,
      {
        eventId: event.eventId,
        eventType: event.eventType,
      },
    );
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

  async refreshStaticSegmentMemberships(segment: SegmentDocument): Promise<void> {
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
