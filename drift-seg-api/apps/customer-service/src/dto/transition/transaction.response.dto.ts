export interface TransactionResponseDto {
  _id: string;
  customerId: string;
  amount: number;
  occurredAt: string;
  externalId: string;
  description: string;
}
