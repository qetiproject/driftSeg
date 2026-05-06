import { CUSTOMER_ERROR_MESSAGES } from '@customer/constants/error-messages';
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
