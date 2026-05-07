import {
  Transaction,
  TransactionDocument,
} from '@app/common/models/transaction-schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class CustomerActivityRepository {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async hasTransactionSince(
    customerId: Types.ObjectId,
    sinceDate: Date,
  ): Promise<boolean> {
    const doc = await this.transactionModel
      .findOne({ customerId, occurredAt: { $gte: sinceDate } })
      .lean(true);
    return doc !== null;
  }

  async getTotalSpentSince(
    customerId: Types.ObjectId,
    sinceDate: Date,
  ): Promise<number> {
    const result = await this.transactionModel.aggregate<{ total: number }>([
      { $match: { customerId, occurredAt: { $gte: sinceDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return result[0]?.total ?? 0;
  }

  async hasTransactionBefore(
    customerId: Types.ObjectId,
    beforeDate: Date,
  ): Promise<boolean> {
    const doc = await this.transactionModel
      .findOne({ customerId, occurredAt: { $lt: beforeDate } })
      .lean(true);
    return doc !== null;
  }

  async getDistinctCustomerIdsWithTransactions(): Promise<Types.ObjectId[]> {
    const ids = await this.transactionModel.distinct('customerId');
    return ids.map((id) => new Types.ObjectId(String(id)));
  }
}
