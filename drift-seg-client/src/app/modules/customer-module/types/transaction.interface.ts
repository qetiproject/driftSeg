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

export interface PaginatedTransactionsResponse {
  items: TransactionResponse[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
}
