import {
  TRANSACTION_CREATED_EVENT,
  TransactionCreatedEvent,
} from '@app/common/dto';
import { TransactionDocument } from '@app/common/models';
import { SEGMENT_EVENTS_CLIENT } from '@customer/constants/tokens';
import {
  CreateTransactionDto,
  CustomerResponseDto,
  TransactionResponseDto,
} from '@customer/dto';
import { TransactionRepository } from '@customer/repositories/transaction.repository';
import { CustomerCommandService } from '@customer/services/customer/customer-command.service';
import { CustomerQueryService } from '@customer/services/customer/customer-query.service';
import { toTransactionResponse } from '@customer/utils';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';

@Injectable()
export class TransactionCommandService {
  private readonly logger = new Logger(TransactionCommandService.name);

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
      customer.id,
      dto.amount,
    );

    this.transactionCreatedEvent(transaction, updatedCustomer, dto);

    return toTransactionResponse(transaction);
  }

  private async createTransactionEntity(
    dto: CreateTransactionDto,
  ): Promise<TransactionDocument> {
    return this.transactionRepository.createTransaction({
      customerId: new Types.ObjectId(dto.customerId),
      amount: dto.amount,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
      description: dto.description,
    });
  }

  private async updateCustomerAfterTransaction(
    customerId: string,
    amount: number,
  ): Promise<CustomerResponseDto> {
    return this.customerCommandService.addSpentAndRefreshStatus(
      customerId,
      amount,
    );
  }

  private transactionCreatedEvent(
    transaction: TransactionDocument,
    customer: CustomerResponseDto,
    dto: CreateTransactionDto,
  ): void {
    const transactionOccurredAt = new Date(
      transaction.occurredAt ?? Date.now(),
    ).toISOString();

    const eventPayload: TransactionCreatedEvent = {
      eventId: randomUUID(),
      eventType: TRANSACTION_CREATED_EVENT,
      occurredAt: new Date().toISOString(),
      data: {
        transactionId: transaction._id.toString(),
        customerId: dto.customerId,
        amount: dto.amount,
        transactionOccurredAt,
        totalSpent: customer.totalSpent,
      },
    };

    try {
      this.segmentEventsClient.emit(TRANSACTION_CREATED_EVENT, eventPayload);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown emit error';
      this.logger.error(
        `Failed to emit transaction created event: ${errorMessage}`,
      );
    }
  }
}
