export const SEGMENT_ERROR_MESSAGES = {
  ONLY_ACTIVE_AND_VIP_RISK_SUPPORTED:
    'Only active_buyers, vip and risk rules are supported.',
  ACTIVE_BUYERS_REQUIRES_DAYS: (days: number) =>
    `active_buyers segment requires days=${days}.`,
  VIP_REQUIRES_DAYS: (days: number) => `vip segment requires days=${days}.`,
  VIP_REQUIRES_MIN_SPEND: (minSpend: number) =>
    `vip segment requires minSpend >= ${minSpend}.`,
  RISK_REQUIRES_INACTIVE_DAYS: (inActiveDays: number) =>
    `risk segment requires inActiveDays=${inActiveDays}.`,
  ACTIVE_BUYERS_NO_DEPENDENCIES:
    'active_buyers must not depend on other segments.',
  VIP_SEGMENT_NO_DEPENDENCIES: 'vip segment must not depend on other segments.',
  RISK_SEGMENT_NO_DEPENDENCIES:
    'risk segment must not depend on other segments.',
  DUPLICATE_NAME: 'Segment with this name already exists.',
  INVALID_SEGMENT_RULES_WARNING: (segmentId: string) =>
    `Skipping segment segmentId=${segmentId} because rules are invalid`,
} as const;
