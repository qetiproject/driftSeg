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

  async createTransaction(document: {
    customerId: string;
    amount: number;
    occurredAt?: Date;
    description?: string;
  }): Promise<TransactionDocument> {
    return this.model.create({
      ...document,
      customerId: new Types.ObjectId(document.customerId),
    });
  }

  async deleteManyByCustomerId(customerId: string): Promise<number> {
    return this.deleteMany({
      customerId: new Types.ObjectId(customerId),
    });
  }
}
