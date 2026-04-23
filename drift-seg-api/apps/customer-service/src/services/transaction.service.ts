import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../dto';
import { CustomerRepository, TransactionRepository } from '../repositories';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly customerRepository: CustomerRepository,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.customerRepository.findOne({
      _id: createTransactionDto.customerId,
    });

    // const created = await this.transactionRepository.create({
    //   customerId: new Types.ObjectId(createTransactionDto.customerId),
    //   amount: createTransactionDto.amount,
    //   occurredAt: createTransactionDto.occurredAt
    //     ? new Date(createTransactionDto.occurredAt)
    //     : new Date(),
    //   externalId: createTransactionDto.externalId,
    //   description: createTransactionDto.description,
    // });

    // await this.customerRepository.findOneAndUpdate(
    //   { _id: createTransactionDto.customerId },
    //   {
    //     $inc: { totalSpent: createTransactionDto.amount },
    //     $set: { status: CustomerStatusEnum.ACTIVE },
    //   },
    // );

    // return this.toTransactionResponse(created);
  }

  // private toTransactionResponse(
  //   transaction: TransactionDocument,
  // ): TransactionResponseDto {
  //   return {
  //     _id: transaction._id.toString(),
  //     customerId: transaction.customerId.toString(),
  //     amount: transaction.amount,
  //     occurredAt: transaction.occurredAt.toISOString(),
  //     externalId: transaction.externalId,
  //     description: transaction.description,
  //   };
  // }
}
