import { AbstractRepository } from '@app/common';
import { Customer, CustomerDocument } from '@app/common/models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CustomerRepository extends AbstractRepository<CustomerDocument> {
  constructor(
    @InjectModel(Customer.name)
    customerModel: Model<CustomerDocument>,
  ) {
    super(customerModel);
  }

  async createCustomer(
    document: Omit<Customer, '_id'>,
  ): Promise<CustomerDocument> {
    const createdCustomer = await this.model.create(document);
    return createdCustomer.toObject();
  }
}
