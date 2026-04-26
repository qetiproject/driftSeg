export interface TransactionResponse {
  _id: string;
  customerId: string;
  amount: number;
  occurredAt: string;
  description?: string;
}

export interface CreateTransactionRequest {
  customerId: string;
  amount: number;
  occurredAt?: string;
  description?: string;
}
