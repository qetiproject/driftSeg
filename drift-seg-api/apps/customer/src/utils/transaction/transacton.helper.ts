import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import type { CustomerDocument, TransactionDocument } from '@app/common/models';
import { CUSTOMER_ERROR_MESSAGES } from '../../constants/error-messages';
import { CreateTransactionDto, TransactionResponseDto } from '../../dto';
import { CustomerRepository } from '../../repositories';
import { NotFoundException } from '@nestjs/common';

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
  const updatedCustomer = await customerRepository.findOneAndUpdate(
    { _id: createTransactionDto.customerId },
    {
      $inc: { totalSpent: createTransactionDto.amount },
      $set: { status: CustomerStatusEnum.ACTIVE },
    },
  );

  if (!updatedCustomer) {
    throw new NotFoundException(CUSTOMER_ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
  }

  return updatedCustomer;
}
