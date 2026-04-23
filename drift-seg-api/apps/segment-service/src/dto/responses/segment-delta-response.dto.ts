export interface SegmentDeltaResponseDto {
  _id: string;
  segmentId: string;
  addedCustomerIds: string[];
  removedCustomerIds: string[];
  triggerEventId: string;
  triggerEventType: string;
  computedAt: string;
}
