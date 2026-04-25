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

export interface PendingBatchEntry {
  customerId: string;
  trigger: PendingTrigger;
}

export interface BatchRecomputePayload {
  eventId: string;
  eventType: string;
  processedCustomers: number;
  customerIds: string[];
  pendingCustomers: number;
  occurredAt: string;
}
