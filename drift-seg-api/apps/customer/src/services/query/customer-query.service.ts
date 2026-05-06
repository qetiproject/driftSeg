import { CustomerResponseDto } from '@customer/dto/customer/customer.response.dto';
import { CustomerRepository } from '@customer/repositories/customer.repository';
import { toCustomerResponse } from '@customer/utils/customer/to-customer-response';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerQueryService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async getCustomers(): Promise<CustomerResponseDto[]> {
    const customers = await this.customerRepository.find({});
    return customers.map((customer) => toCustomerResponse(customer));
  }
}
