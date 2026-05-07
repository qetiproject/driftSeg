import {
  TRANSACTION_CREATED_EVENT,
  TransactionCreatedEvent,
} from '@app/common/dto';
import { TransactionDocument } from '@app/common/models';
import { CUSTOMER_ERROR_MESSAGES } from '@customer/constants/error-messages';
import { toTransactionResponse } from '@customer/utils';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { SEGMENT_EVENTS_CLIENT } from '../../constants/tokens';
import {
  CreateTransactionDto,
  CustomerResponseDto,
  TransactionResponseDto,
} from '../../dto';
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
    dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const customer: CustomerResponseDto =
      await this.customerQueryService.getCustomerById(dto.customerId);

    const transaction: TransactionDocument =
      await this.createTransactionEntity(dto);

    const updatedCustomer = await this.updateCustomerAfterTransaction(
      customer,
      dto.amount,
    );

    this.transactionCreatedEvent(transaction, updatedCustomer, dto);

    return toTransactionResponse(transaction);
  }

  private async createTransactionEntity(
    dto: CreateTransactionDto,
  ): Promise<TransactionDocument> {
    return this.transactionRepository.create({
      customerId: new Types.ObjectId(dto.customerId),
      amount: dto.amount,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
      description: dto.description,
    });
  }

  private async updateCustomerAfterTransaction(
    customer: CustomerResponseDto,
    amount: number,
  ): Promise<CustomerResponseDto> {
    const updatedCustomer =
      await this.customerCommandService.addSpentAndRefreshStatus(
        customer.id,
        amount,
      );

    if (!updatedCustomer) {
      throw new NotFoundException(CUSTOMER_ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    return updatedCustomer;
  }

  private transactionCreatedEvent(
    transaction: TransactionDocument,
    customer: CustomerResponseDto,
    dto: CreateTransactionDto,
  ): void {
    const eventPayload: TransactionCreatedEvent = {
      eventId: randomUUID(),
      eventType: TRANSACTION_CREATED_EVENT,
      occurredAt: new Date().toISOString(),
      data: {
        transactionId: transaction._id.toString(),
        customerId: dto.customerId,
        amount: dto.amount,
        transactionOccurredAt: transaction.occurredAt!.toISOString(),
        totalSpent: customer.totalSpent,
      },
    };

    this.segmentEventsClient.emit(TRANSACTION_CREATED_EVENT, eventPayload);
  }
}
