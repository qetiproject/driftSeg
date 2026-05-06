import { CUSTOMER_ERROR_MESSAGES } from '@customer/constants/error-messages';
import { UpdateCustomerDto } from '@customer/dto/customer/update-customer.dto';
import {
  CustomerRepository,
  TransactionRepository,
} from '@customer/repositories';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async getCustomerById(_id: string) {
    return await this.customerRepository.findOne({ _id });
  }

  async updateCustomer(_id: string, updateCustomerDto: UpdateCustomerDto) {
    return await this.customerRepository.findOneAndUpdate(
      { _id },
      { $set: updateCustomerDto },
    );
  }

  async removeCustomer(_id: string) {
    const deletedCustomer = await this.customerRepository.findOneAndDelete({
      _id,
    });
    if (!deletedCustomer) {
      throw new NotFoundException(CUSTOMER_ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }
    await this.transactionRepository.deleteManyByCustomerId(_id);
    return deletedCustomer;
  }
}
