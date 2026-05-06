import { CustomerResponseDto } from '@customer/dto/customer/customer.response.dto';
import { CustomerRepository } from '@customer/repositories/customer.repository';
import { toCustomerResponse } from '@customer/utils/customer/to-customer-response';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerQueryService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async getCustomers(page = 1, limit = 20): Promise<CustomerResponseDto[]> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const customers = await this.customerRepository.find(
      {},
      {
        skip,
        limit: safeLimit,
      },
    );

    return customers.map(toCustomerResponse);
  }
}
