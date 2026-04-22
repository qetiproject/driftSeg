export enum SegmentType {
  DYNAMIC = 'dynamic',
  STATIC = 'static',
}

export enum SegmentRuleKind {
  ACTIVE_BUYERS = 'active_buyers',
  VIP = 'vip',
  RISK = 'risk',
  SEGMENT_COMPOSITION = 'segment_composition',
}

export interface ActiveBuyersRule {
  kind: SegmentRuleKind.ACTIVE_BUYERS;
  days: number;
}

export interface VipRule {
  kind: SegmentRuleKind.VIP;
  days: number;
  minSpend: number;
}

export interface RiskRule {
  kind: SegmentRuleKind.RISK;
  inactiveDays: number;
}

export interface SegmentCompositionRule {
  kind: SegmentRuleKind.SEGMENT_COMPOSITION;
  segmentIds: string[];
  operator: 'intersection' | 'union';
}

export type SegmentRule =
  | ActiveBuyersRule
  | VipRule
  | RiskRule
  | SegmentCompositionRule;

export interface SegmentDelta {
  segmentId: string;
  segmentName: string;
  addedCustomerIds: string[];
  removedCustomerIds: string[];
  evaluatedAt: string;
}
