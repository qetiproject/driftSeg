import { CUSTOMER_ERROR_MESSAGES } from '@customer/constants/error-messages';
import { PaginatedCustomersResponseDto } from '@customer/dto';
import { CustomerResponseDto } from '@customer/dto/customer/customer.response.dto';
import { CustomerRepository } from '@customer/repositories/customer.repository';
import { toCustomerResponse } from '@customer/utils/customer/to-customer-response';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CustomerQueryService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async getCustomers(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedCustomersResponseDto> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;
    const filter = {};

    const customers = await this.customerRepository.find(filter, {
      skip,
      limit: safeLimit,
    });

    const totalItems = await this.customerRepository.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / safeLimit);

    return {
      items: customers.map(toCustomerResponse),
      totalItems,
      totalPages,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getCustomerById(id: string): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException(CUSTOMER_ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    return toCustomerResponse(customer);
  }
}
