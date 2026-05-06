import { CustomerResponseDto } from '@apps/customer/src/dto/customer/customer.response.dto';
import { CustomerRepository } from '@apps/customer/src/repositories/customer.repository';
import { toCustomerResponse } from '@apps/customer/src/utils/customer/to-customer-response';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerQueryService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async getCustomers(): Promise<CustomerResponseDto[]> {
    const customers = await this.customerRepository.find({});
    return customers.map((customer) => toCustomerResponse(customer));
  }
}
