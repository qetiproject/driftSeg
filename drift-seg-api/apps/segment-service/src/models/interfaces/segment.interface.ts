export interface AggregatedSegmentDelta {
  segmentId: string;
  segmentkind: string;
  addedCustomerIds: Set<string>;
  removedCustomerIds: Set<string>;
}

export interface SegmentDeltaPayload {
  eventId: string;
  eventType: string;
  segmentId: string;
  segmentkind: string;
  addedCustomerIds: string[];
  removedCustomerIds: string[];
  occurredAt: string;
}

export interface PendingTrigger {
  eventId: string;
  eventType: string;
}

