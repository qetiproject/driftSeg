export enum SegmentTypeEnum {
  DYNAMIC = 'dynamic',
  STATIC = 'static',
}

export enum SegmentRuleKind {
  ACTIVE_BUYERS = 'active_buyers',
}

export interface ActiveBuyersRuleInput {
  kind: SegmentRuleKind.ACTIVE_BUYERS;
  days: number;
}

export type SegmentRuleInput = ActiveBuyersRuleInput;
