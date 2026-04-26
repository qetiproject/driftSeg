import { AbstractRepository } from '@app/common';
import { CustomerDocument } from '@app/common/models';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CustomerRepository extends AbstractRepository<CustomerDocument> {
  protected readonly logger = new Logger(CustomerRepository.name);

  constructor(
    @InjectModel(CustomerDocument.name)
    customerModel: Model<CustomerDocument>,
  ) {
    super(customerModel);
  }
}
