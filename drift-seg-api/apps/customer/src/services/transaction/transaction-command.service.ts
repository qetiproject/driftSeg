import {
  TRANSACTION_CREATED_EVENT,
  TransactionCreatedEvent,
} from '@app/common/dto';
import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { toTransactionResponse } from '@customer/utils';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { SEGMENT_EVENTS_CLIENT } from '../../constants/tokens';
import { CreateTransactionDto, TransactionResponseDto } from '../../dto';
import { TransactionRepository } from '../../repositories';
import { CustomerCommandService } from '../customer/customer-command.service';
import { CustomerQueryService } from '../customer/customer-query.service';

@Injectable()
export class TransactionCommandService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    @Inject(SEGMENT_EVENTS_CLIENT)
    private readonly segmentEventsClient: ClientProxy,
    private readonly customerQueryService: CustomerQueryService,
    private readonly customerCommandService: CustomerCommandService,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const customer = await this.customerQueryService.getCustomerById(
      createTransactionDto.customerId,
    );

    const newTransaction = await this.transactionRepository.create({
      customerId: new Types.ObjectId(createTransactionDto.customerId),
      amount: createTransactionDto.amount,
      occurredAt: createTransactionDto.occurredAt
        ? new Date(createTransactionDto.occurredAt)
        : new Date(),
      description: createTransactionDto.description,
    });

    const newTotalSpent = customer.totalSpent + createTransactionDto.amount;

    const newStatus =
      newTotalSpent > 1000
        ? CustomerStatusEnum.ACTIVE
        : CustomerStatusEnum.INACTIVE;

    const updatedCustomer = await this.customerCommandService.updateCustomer(
      createTransactionDto.customerId,
      {
        totalSpent: newTotalSpent,
        status: newStatus,
      },
    );
    const transactionOccurredAt = (
      newTransaction.occurredAt ?? new Date()
    ).toISOString();

    const eventPayload: TransactionCreatedEvent = {
      eventId: randomUUID(),

      eventType: TRANSACTION_CREATED_EVENT,
      occurredAt: new Date().toISOString(),
      data: {
        transactionId: newTransaction._id.toString(),
        customerId: createTransactionDto.customerId,
        amount: createTransactionDto.amount,
        transactionOccurredAt,
        totalSpent: updatedCustomer!.totalSpent,
      },
    };

    this.segmentEventsClient.emit(TRANSACTION_CREATED_EVENT, eventPayload);

    return toTransactionResponse(newTransaction);
  }
}
