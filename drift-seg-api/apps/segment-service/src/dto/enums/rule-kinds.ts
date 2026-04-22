export enum SegmentRuleKind {
  ACTIVE_BUYERS = 'active_buyers',
  VIP = 'vip',
  RISK = 'risk',
  SEGMENT_COMPOSITION = 'segment_composition',
  MANUAL_SNAPSHOT = 'manual_snapshot',
}

export enum SegmentCompositionOperator {
  INTERSECTION = 'intersection',
  UNION = 'union',
}

export interface SegmentRuleInput {
  kind: SegmentRuleKind;
  [key: string]: unknown;
}
