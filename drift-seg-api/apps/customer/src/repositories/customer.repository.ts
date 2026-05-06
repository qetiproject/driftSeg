import { AbstractRepository } from '@app/common';
import { Customer, CustomerDocument } from '@app/common/models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, QueryFilter, SortOrder } from 'mongoose';

@Injectable()
export class CustomerRepository extends AbstractRepository<CustomerDocument> {
  constructor(
    @InjectModel(Customer.name)
    customerModel: Model<CustomerDocument>,
  ) {
    super(customerModel);
  }

  async findMany(
    filter: QueryFilter<Customer>,
    projection: ProjectionType<Customer>,
    options: {
      skip?: number;
      limit?: number;
      sort?: Partial<Record<keyof Customer, SortOrder>>;
    },
  ): Promise<Customer[]> {
    return this.model
      .find(filter, projection)
      .sort(options.sort ?? { createdAt: -1 })
      .skip(options.skip ?? 0)
      .limit(options.limit ?? 10)
      .lean()
      .exec();
  }
}
