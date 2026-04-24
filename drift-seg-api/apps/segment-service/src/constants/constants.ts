export const SEGMENT_RECOMPUTE_CRON = '*/5 * * * *';
export const SEGMENT_EVENT_FLUSH_CRON = '*/15 * * * * *';
export const SEGMENT_EVENT_BATCH_SIZE = 500;
export const SEGMENT_RECOMPUTE_CHUNK_SIZE = 1000;
export const DAY_IN_MS = 24 * 60 * 60 * 1000;
export const ADD_CUSTOMER_TO_SEGMENT = (
  customerId: string,
  segmentId: string,
): string =>
  `customer customerId=${customerId} added to segment segmentId=${segmentId}`;
export const REMOVE_CUSTOMER_FROM_SEGMENT = (
  customerId: string,
  segmentId: string,
): string =>
  `customer customerId=${customerId} removed from segment segmentId=${segmentId}`;
export const SCHEDULER_EVENT_TYPE = 'segment.recompute.scheduler';
export const SEGMENT_BATCH_RECOMPUTE_EVENT = 'segment.membership.batch.recomputed';
