import {
  TRANSACTION_CREATED_EVENT,
  TransactionCreatedEvent,
} from '@app/common/dto';
import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  SegmentRuleInput,
  SegmentRuleKind,
  SegmentTypeEnum,
} from '../dto/create-segment';
import { SegmentMembershipDocument } from '../models';
import { SegmentMembershipRepository, SegmentRepository } from '../repositories';

@Injectable()
export class SegmentMembershipService {
  private readonly logger = new Logger(SegmentMembershipService.name);

  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
  ) {}

  async processTransactionCreated(event: TransactionCreatedEvent): Promise<void> {
    if (event.eventType !== TRANSACTION_CREATED_EVENT) {
      return;
    }

    const segments = await this.segmentRepository.find({
      type: SegmentTypeEnum.DYNAMIC,
    });

    for (const segment of segments) {
      const shouldBeMember = this.resolveMembership(segment.rules, event);
      const customerObjectId = new Types.ObjectId(event.data.customerMongoId);
      const currentMembership =
        await this.segmentMembershipRepository.findActiveMembership(
          segment._id,
          customerObjectId,
        );

      if (shouldBeMember && !currentMembership) {
        await this.segmentMembershipRepository.create({
          segmentId: segment._id,
          customerId: customerObjectId,
          isActive: true,
        } as Omit<SegmentMembershipDocument, '_id'>);
        this.logger.log(
          `customer ${customerObjectId} added to segment ${segment._id.toString()}`,
        );
      }

      if (!shouldBeMember && currentMembership) {
        await this.segmentMembershipRepository.findOneAndUpdate(
          { _id: currentMembership._id },
          { $set: { isActive: false } },
        );
        this.logger.log(
          `customer ${customerObjectId} removed from segment ${segment._id.toString()}`,
        );
      }
    }
  }

  private resolveMembership(
    rules: SegmentRuleInput,
    event: TransactionCreatedEvent,
  ): boolean {
    const kind = rules.kind;

    if (kind === SegmentRuleKind.ACTIVE_BUYERS) {
      return true;
    }

    if (kind === SegmentRuleKind.VIP) {
      const minSpend = Number(rules.minSpend ?? 0);
      return event.data.totalSpent >= minSpend;
    }

    if (kind === SegmentRuleKind.RISK) {
      return false;
    }

    return false;
  }
}
