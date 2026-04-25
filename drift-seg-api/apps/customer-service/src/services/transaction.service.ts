import {
  TRANSACTION_CREATED_EVENT,
  TransactionCreatedEvent,
} from '@app/common/dto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { SEGMENT_EVENTS_CLIENT } from '../constants/tokens';
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
    @Inject(SEGMENT_EVENTS_CLIENT)
    private readonly segmentEventsClient: ClientProxy,
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

    const updatedCustomer = await updateCustomerAfterTransaction(
      this.customerRepository,
      createTransactionDto,
    );

    const eventPayload: TransactionCreatedEvent = {
      eventId: randomUUID(),

      eventType: TRANSACTION_CREATED_EVENT,
      occurredAt: new Date().toISOString(),
      data: {
        transactionId: created._id.toString(),
        customerId: createTransactionDto.customerId,
        amount: createTransactionDto.amount,
        transactionOccurredAt: created.occurredAt.toISOString(),
        totalSpent: updatedCustomer.totalSpent,
      },
    };

    this.segmentEventsClient.emit(TRANSACTION_CREATED_EVENT, eventPayload);

    return toTransactionResponse(created);
  }

  async getTransactions(): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.find({});
    return transactions.map((transaction) =>
      toTransactionResponse(transaction),
    );
  }
}
