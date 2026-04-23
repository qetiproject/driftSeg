import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ActiveBuyersRuleInput,
  RiskRuleInput,
  SegmentRuleInput,
  SegmentRuleKind,
  VipBuyersRuleInput,
} from '../dto/create-segment';
import { CustomerActivityRepository } from '../repositories';

@Injectable()
export class SegmentRuleEvaluatorService {
  constructor(
    private readonly customerActivityRepository: CustomerActivityRepository,
  ) {}

  async evaluateMembership(
    rules: SegmentRuleInput,
    customerId: Types.ObjectId,
    asOf: Date = new Date(),
  ): Promise<boolean> {
    switch (rules.kind) {
      case SegmentRuleKind.ACTIVE_BUYERS:
        return this.evaluateActiveBuyers(rules, customerId, asOf);
      case SegmentRuleKind.VIP:
        return this.evaluateVip(rules, customerId, asOf);
      case SegmentRuleKind.RISK:
        return this.evaluateRisk(rules, customerId, asOf);
      default:
        return false;
    }
  }

  private async evaluateActiveBuyers(
    rules: ActiveBuyersRuleInput,
    customerId: Types.ObjectId,
    asOf: Date,
  ): Promise<boolean> {
    const since = new Date(asOf.getTime() - rules.days * 24 * 60 * 60 * 1000);
    return this.customerActivityRepository.hasTransactionSince(customerId, since);
  }

  private async evaluateVip(
    rules: VipBuyersRuleInput,
    customerId: Types.ObjectId,
    asOf: Date,
  ): Promise<boolean> {
    const since = new Date(asOf.getTime() - rules.days * 24 * 60 * 60 * 1000);
    const totalSpent = await this.customerActivityRepository.getTotalSpentSince(
      customerId,
      since,
    );
    return totalSpent >= rules.minSpend;
  }

  private async evaluateRisk(
    rules: RiskRuleInput,
    customerId: Types.ObjectId,
    asOf: Date,
  ): Promise<boolean> {
    const cutoff = new Date(
      asOf.getTime() - rules.inActiveDays * 24 * 60 * 60 * 1000,
    );
    const hasRecentTransaction =
      await this.customerActivityRepository.hasTransactionSince(customerId, cutoff);
    const hadOlderTransaction =
      await this.customerActivityRepository.hasTransactionBefore(customerId, cutoff);

    return !hasRecentTransaction && hadOlderTransaction;
  }
}
