import type { TransactionDocument } from '@app/common/models';
import { TransactionResponseDto } from '@customer/dto/transition/transaction.response.dto';

export function toTransactionResponse(
  transaction: TransactionDocument,
): TransactionResponseDto {
  const occurredAt = (transaction.occurredAt ?? new Date()).toISOString();
  return {
    _id: transaction._id.toString(),
    customerId: transaction.customerId.toString(),
    amount: transaction.amount,
    occurredAt,
    description: transaction.description,
  };
}
