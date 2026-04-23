import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { TransactionDocument } from '@app/common/models';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateTransactionDto, TransactionResponseDto } from '../dto';
import { CustomerRepository, TransactionRepository } from '../repositories';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly customerRepository: CustomerRepository,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    this.existCustomerById(createTransactionDto.customerId);

    const created = await this.transactionRepository.create({
      customerId: new Types.ObjectId(createTransactionDto.customerId),
      amount: createTransactionDto.amount,
      occurredAt: createTransactionDto.occurredAt
        ? new Date(createTransactionDto.occurredAt)
        : new Date(),
      description: createTransactionDto.description,
    });

    this.updateCustomerTransaction(createTransactionDto);

    return this.toTransactionResponse(created);
  }

  private toTransactionResponse(
    transaction: TransactionDocument,
  ): TransactionResponseDto {
    return {
      _id: transaction._id.toString(),
      customerId: transaction.customerId.toString(),
      amount: transaction.amount,
      occurredAt: transaction.occurredAt.toISOString(),
      externalId: transaction.externalId,
      description: transaction.description,
    };
  }

  private async existCustomerById(customerId: string) {
    await this.customerRepository.findOne({
      _id: customerId,
    });
  }

  private async updateCustomerTransaction(
    createTransactionDto: CreateTransactionDto,
  ) {
    await this.customerRepository.findOneAndUpdate(
      { _id: createTransactionDto.customerId },
      {
        $inc: { totalSpent: createTransactionDto.amount },
        $set: { status: CustomerStatusEnum.ACTIVE },
      },
    );
  }
}
