import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomerActivityDocument } from '../models';

@Injectable()
export class CustomerActivityRepository extends AbstractRepository<CustomerActivityDocument> {
  protected readonly logger = new Logger(CustomerActivityRepository.name);

  constructor(
    @InjectModel(CustomerActivityDocument.name)
    customerActivityModel: Model<CustomerActivityDocument>,
  ) {
    super(customerActivityModel);
  }

  async appendTransaction(
    customerId: string,
    amount: number,
    at: Date,
  ): Promise<CustomerActivityDocument> {
    const objectId = new Types.ObjectId(customerId);
    const updated = await this.model
      .findOneAndUpdate(
        { customerId: objectId },
        {
          $setOnInsert: { _id: new Types.ObjectId(), customerId: objectId },
          $push: { transactions: { amount, at } },
        },
        { upsert: true, new: true },
      )
      .lean<CustomerActivityDocument>(true);

    if (!updated) {
      throw new Error('Failed to append customer transaction.');
    }

    return updated;
  }

  async mergeProfile(
    customerId: string,
    patch: Record<string, unknown>,
  ): Promise<CustomerActivityDocument> {
    const objectId = new Types.ObjectId(customerId);
    const updated = await this.model
      .findOneAndUpdate(
        { customerId: objectId },
        {
          $setOnInsert: { _id: new Types.ObjectId(), customerId: objectId },
          $set: { profile: patch },
        },
        { upsert: true, new: true },
      )
      .lean<CustomerActivityDocument>(true);

    if (!updated) {
      throw new Error('Failed to update customer profile.');
    }

    return updated;
  }

  async upsertTransactionsInChunks(
    input: Array<{ customerId: string; amount: number; at: Date }>,
    chunkSize: number,
  ): Promise<number> {
    let processed = 0;
    for (let i = 0; i < input.length; i += chunkSize) {
      const chunk = input.slice(i, i + chunkSize);
      const ops = chunk.map((item) => {
        const customerId = new Types.ObjectId(item.customerId);
        return {
          updateOne: {
            filter: { customerId },
            update: {
              $setOnInsert: { _id: new Types.ObjectId(), customerId },
              $push: { transactions: { amount: item.amount, at: item.at } },
            },
            upsert: true,
          },
        };
      });

      if (ops.length > 0) {
        await this.model.bulkWrite(ops, { ordered: false });
      }
      processed += chunk.length;
    }

    return processed;
  }
}
