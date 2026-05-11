import { TRANSACTION_CREATED_EVENT } from '@segment/constants/constants';

export interface TransactionCreatedEvent {
  eventId: string;
  eventType: typeof TRANSACTION_CREATED_EVENT;
  occurredAt: string;
  data: {
    transactionId: string;
    customerId: string;
    amount: number;
    transactionOccurredAt: string;
    totalSpent: number;
  };
}
