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
import { getSinceDateByDays } from '../utils/helper/segment.helper';

@Injectable()
export class SegmentRuleEvaluatorService {
  constructor(
    private readonly customerActivityRepository: CustomerActivityRepository,
  ) {}

  async shouldCustomerBelongToSegment(
    rules: SegmentRuleInput,
    customerId: Types.ObjectId,
    date: Date = new Date(),
  ): Promise<boolean> {
    switch (rules.kind) {
      case SegmentRuleKind.ACTIVE_BUYERS:
        return this.isActiveBuyer(rules, customerId, date);
      case SegmentRuleKind.VIP:
        return this.isVipCustomer(rules, customerId, date);
      case SegmentRuleKind.RISK:
        return this.isRiskCustomer(rules, customerId, date);
      default:
        return false;
    }
  }

  private async isActiveBuyer(
    rules: ActiveBuyersRuleInput,
    customerId: Types.ObjectId,
    date: Date,
  ): Promise<boolean> {
    const since = getSinceDateByDays(date, rules.days);
    return this.customerActivityRepository.hasTransactionSince(
      customerId,
      since,
    );
  }

  private async isVipCustomer(
    rules: VipBuyersRuleInput,
    customerId: Types.ObjectId,
    date: Date,
  ): Promise<boolean> {
    const since = getSinceDateByDays(date, rules.days);
    const totalSpent = await this.customerActivityRepository.getTotalSpentSince(
      customerId,
      since,
    );
    return totalSpent >= rules.minSpend;
  }

  private async isRiskCustomer(
    rules: RiskRuleInput,
    customerId: Types.ObjectId,
    date: Date,
  ): Promise<boolean> {
    const cutoff = getSinceDateByDays(date, rules.inActiveDays);
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
