export const SEGMENT_RECOMPUTE_CRON = '*/5 * * * *';
export const SEGMENT_EVENT_FLUSH_CRON = '*/15 * * * * *';
export const SEGMENT_EVENT_BATCH_SIZE = 200;
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
export const PROCESSED_MEMBERSHIP_BATCH_LOG = (
  processedCustomers: number,
  pendingCustomers: number,
): string =>
  `Processed membership batch size=${processedCustomers}, pending=${pendingCustomers}`;
export const UI_DELTA_EVENT_CONSUMED_LOG = (event: string): string =>
  `UI delta event consumed: ${event}`;
export const CAMPAIGN_DELTA_EVENT_CONSUMED_LOG = (event: string): string =>
  `Campaign delta event consumed: ${event}`;
export const FAILED_TO_INDEX_BATCH_EVENT_LOG = (error: string): string =>
  `Failed to index batch event: ${error}`;
export const SCHEDULER_EVENT_TYPE = 'segment.recompute.scheduler';
export const SEGMENT_BATCH_RECOMPUTE_EVENT =
  'segment.membership.batch.recomputed';
export const SEGMENT_UI_DELTA_EVENT = 'segment.ui.delta.changed';
export const SEGMENT_CAMPAIGN_DELTA_EVENT = 'segment.campaign.delta.changed';
export const SEGMENT_STATIC_MANUAL_REFRESH_EVENT =
  'segment.static.manual_refresh';
export const SEGMENT_BATCH_EVENT_ID_PREFIX = 'batch';
export const SEGMENT_STATIC_REFRESH_EVENT_ID_PREFIX = 'segment-static-refresh';
export const SEGMENT_EVENTS_QUEUE = 'segment.events.queue';
export const SEGMENT_NOTIFICATIONS_QUEUE = 'segment.notifications.queue';
