import { AbstractRepository } from '@app/common';
import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { Customer, CustomerDocument } from '@app/common/models';
import { UpdateCustomerDto } from '@customer/dto/customer/update-customer.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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

  async updateById(
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<CustomerDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .lean<CustomerDocument>();
  }

  async addSpentAndRefreshStatus(
    id: string,
    amount: number,
  ): Promise<CustomerDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        {
          $inc: { totalSpent: amount },
          $set: { status: CustomerStatusEnum.ACTIVE },
        },
        { new: true },
      )
      .lean<CustomerDocument>();
  }
}
