import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import type { CustomerDocument, TransactionDocument } from '@app/common/models';
import { CreateTransactionDto, TransactionResponseDto } from '../../dto';
import { CustomerRepository } from '../../repositories';

export function toTransactionResponse(
  transaction: TransactionDocument,
): TransactionResponseDto {
  return {
    _id: transaction._id.toString(),
    customerId: transaction.customerId.toString(),
    amount: transaction.amount,
    occurredAt: transaction.occurredAt.toISOString(),
    description: transaction.description,
  };
}

export async function existCustomerById(
  customerRepository: CustomerRepository,
  customerId: string,
): Promise<void> {
  await customerRepository.findOne({ _id: customerId });
}

export async function updateCustomerAfterTransaction(
  customerRepository: CustomerRepository,
  createTransactionDto: CreateTransactionDto,
): Promise<CustomerDocument> {
  return await customerRepository.findOneAndUpdate(
    { _id: createTransactionDto.customerId },
    {
      $inc: { totalSpent: createTransactionDto.amount },
      $set: { status: CustomerStatusEnum.ACTIVE },
    },
  );
}
