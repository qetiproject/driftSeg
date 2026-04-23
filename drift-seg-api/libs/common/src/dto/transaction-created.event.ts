export const TRANSACTION_CREATED_EVENT = 'customer.transaction.created';

export interface TransactionCreatedEvent {
  eventId: string;
  eventType: typeof TRANSACTION_CREATED_EVENT;
  occurredAt: string;
  data: {
    transactionId: string;
    customerMongoId: string;
    amount: number;
    transactionOccurredAt: string;
    totalSpent: number;
  };
}
