import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ActiveBuyersRuleInput,
  RiskRuleInput,
  SegmentRuleInput,
  SegmentRuleKind,
  VipBuyersRuleInput,
} from '../dto';
import { CustomerActivityRepository } from '../repositories';

@Injectable()
export class SegmentRuleEvaluatorService {
  constructor(
    private readonly customerActivityRepository: CustomerActivityRepository,
  ) {}

  async shoulCustomerMemberToSegment(
    rules: SegmentRuleInput,
    customerId: Types.ObjectId,
    date: Date = new Date(),
  ): Promise<boolean> {
    switch (rules.kind) {
      case SegmentRuleKind.ACTIVE_BUYERS:
        return this.isActiveBuyerSegment(rules, customerId, date);
      case SegmentRuleKind.VIP:
        return this.isVipSegment(rules, customerId, date);
      case SegmentRuleKind.RISK:
        return this.isRiskSegment(rules, customerId, date);
      default:
        return false;
    }
  }

  private async isActiveBuyerSegment(
    rules: ActiveBuyersRuleInput,
    customerId: Types.ObjectId,
    date: Date,
  ): Promise<boolean> {
    const since = new Date(date.getTime() - rules.days * 24 * 60 * 60 * 1000);
    return this.customerActivityRepository.hasTransactionSince(
      customerId,
      since,
    );
  }

  private async isVipSegment(
    rules: VipBuyersRuleInput,
    customerId: Types.ObjectId,
    date: Date,
  ): Promise<boolean> {
    const since = new Date(date.getTime() - rules.days * 24 * 60 * 60 * 1000);
    const totalSpent = await this.customerActivityRepository.getTotalSpentSince(
      customerId,
      since,
    );
    return totalSpent >= rules.minSpend;
  }

  private async isRiskSegment(
    rules: RiskRuleInput,
    customerId: Types.ObjectId,
    date: Date,
  ): Promise<boolean> {
    const cutoff = new Date(
      date.getTime() - rules.inActiveDays * 24 * 60 * 60 * 1000,
    );
    const hasRecentTransaction =
      await this.customerActivityRepository.hasTransactionSince(
        customerId,
        cutoff,
      );
    const hadOlderTransaction =
      await this.customerActivityRepository.hasTransactionBefore(
        customerId,
        cutoff,
      );

    return !hasRecentTransaction && hadOlderTransaction;
  }
}
