export enum SegmentTypeEnum {
  DYNAMIC = 'dynamic',
  STATIC = 'static',
}

export enum SegmentRuleKind {
  ACTIVE_BUYERS = 'active_buyers',
  VIP = 'vip',
  RISK = 'risk',
}

export interface ActiveBuyersRuleInput {
  kind: SegmentRuleKind.ACTIVE_BUYERS;
  days: number;
}

export interface VipBuyersRuleInput {
  kind: SegmentRuleKind.VIP;
  days: number;
  minSpend: number;
}

export interface RiskRuleInput {
  kind: SegmentRuleKind.RISK;
  inActiveDays: number;
}

export type SegmentRuleInput =
  | ActiveBuyersRuleInput
  | VipBuyersRuleInput
  | RiskRuleInput;
