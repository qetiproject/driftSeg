import { SegmentRuleKind } from '../segment-rule';

export interface SegmentDeltaResponseDto {
  _id: string;
  segmentId: string;
  segmentkind: SegmentRuleKind;
  addedCustomerIds: string[];
  removedCustomerIds: string[];
  triggerEventId: string;
  triggerEventType: string;
  computedAt: string;
}
