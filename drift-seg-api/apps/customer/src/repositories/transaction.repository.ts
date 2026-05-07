import { AbstractRepository } from '@app/common';
import {
  Transaction,
  TransactionDocument,
} from '@app/common/models/transaction-schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class TransactionRepository extends AbstractRepository<TransactionDocument> {
  protected readonly logger = new Logger(TransactionRepository.name);

  constructor(
    @InjectModel(Transaction.name)
    transactionModel: Model<TransactionDocument>,
  ) {
    super(transactionModel);
  }

  async createTransaction(
    document: Pick<Transaction, 'customerId' | 'amount' | 'occurredAt' | 'description'>,
  ): Promise<TransactionDocument> {
    return this.model.create(document);
  }

  async deleteManyByCustomerId(customerId: string): Promise<number> {
    const result = await this.model.deleteMany({
      customerId: new Types.ObjectId(customerId),
    });
    return result.deletedCount ?? 0;
  }
}
