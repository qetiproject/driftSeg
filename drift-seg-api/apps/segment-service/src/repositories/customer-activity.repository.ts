import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TransactionDocument } from '@app/common/models/transaction-schema';

@Injectable()
export class CustomerActivityRepository {
  constructor(
    @InjectModel(TransactionDocument.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async hasTransactionSince(
    customerId: Types.ObjectId,
    since: Date,
  ): Promise<boolean> {
    const doc = await this.transactionModel
      .findOne({ customerId, occurredAt: { $gte: since } })
      .lean(true);
    return doc !== null;
  }

  async getTotalSpentSince(
    customerId: Types.ObjectId,
    since: Date,
  ): Promise<number> {
    const result = await this.transactionModel.aggregate<{ total: number }>([
      { $match: { customerId, occurredAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return result[0]?.total ?? 0;
  }

  async hasTransactionBefore(
    customerId: Types.ObjectId,
    before: Date,
  ): Promise<boolean> {
    const doc = await this.transactionModel
      .findOne({ customerId, occurredAt: { $lt: before } })
      .lean(true);
    return doc !== null;
  }

  async getDistinctCustomerIdsWithTransactions(): Promise<Types.ObjectId[]> {
    const ids = await this.transactionModel.distinct('customerId');
    return ids.map((id) => new Types.ObjectId(String(id)));
  }
}
