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

    const customers = await this.customerRepository.findMany(
      {},
      {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        totalSpent: 1,
        status: 1,
      },
      { skip, limit: safeLimit, sort: { createdAt: -1 } },
    );

    return customers.map(toCustomerResponse);
  }
}
