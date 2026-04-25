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
export const FAILED_TO_PARSE_PENDING_TRIGGER_LOG = (
  customerId: string,
): string => `Failed to parse pending trigger for customerId=${customerId}`;
export const REDIS_CLIENT_ERROR_LOG = (errorMessage: string): string =>
  `Redis client error: ${errorMessage}`;
export const ELASTICSEARCH_NODE_ENV_KEY = 'ELASTICSEARCH_NODE';
export const SEGMENT_MEMBERSHIP_EVENTS_INDEX_PATH =
  '/segment-membership-events/_doc';
export const HTTP_POST_METHOD = 'POST';
export const CONTENT_TYPE_HEADER_KEY = 'content-type';
export const APPLICATION_JSON_CONTENT_TYPE = 'application/json';
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
export const SEGMENT_SERVICE_ENV_FILE_PATH = 'apps/segment-service/.env';
export const SEGMENT_PENDING_EVENTS_REDIS_HASH_KEY =
  'segment:pending-events:map';
export const SEGMENT_PENDING_EVENTS_REDIS_INDEX_KEY =
  'segment:pending-events:index';

export const REDIS_CLIENT_STATUS = {
  WAIT: 'wait',
  END: 'end',
} as const;

export const REDIS_CLIENT_EVENT = {
  ERROR: 'error',
} as const;
