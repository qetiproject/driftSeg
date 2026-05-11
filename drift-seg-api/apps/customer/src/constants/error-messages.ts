export const CUSTOMER_ERROR_MESSAGES = {
  CUSTOMER_NOT_FOUND: 'Customer was not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists.',
} as const;

export const TRANSACTION_ERROR_MESSAGES = {
  UNKNOWN_CREATE_ERROR: 'Unknown transaction create error',
  UNKNOWN_EMIT_ERROR: 'Unknown emit error',
  POST_PROCESSING_FAILED_PREFIX: (message: string) =>
    `Transaction created but post-processing failed: ${message}`,
  EMIT_FAILED_PREFIX: 'Failed to emit transaction created event',
} as const;
