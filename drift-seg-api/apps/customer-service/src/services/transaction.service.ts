import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateTransactionDto, TransactionResponseDto } from '../dto';
import { CustomerRepository, TransactionRepository } from '../repositories';
import {
  existCustomerById,
  toTransactionResponse,
  updateCustomerAfterTransaction,
} from '../utils/transaction/transacton.helper';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly customerRepository: CustomerRepository,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    await existCustomerById(
      this.customerRepository,
      createTransactionDto.customerId,
    );

    const created = await this.transactionRepository.create({
      customerId: new Types.ObjectId(createTransactionDto.customerId),
      amount: createTransactionDto.amount,
      occurredAt: createTransactionDto.occurredAt
        ? new Date(createTransactionDto.occurredAt)
        : new Date(),
      description: createTransactionDto.description,
    });

    await updateCustomerAfterTransaction(
      this.customerRepository,
      createTransactionDto,
    );

    return toTransactionResponse(created);
  }
}
