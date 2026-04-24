export const SEGMENT_RECOMPUTE_CRON = '*/5 * * * *';
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
