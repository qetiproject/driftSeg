import { Injectable } from '@nestjs/common';
import { CustomerResponseDto } from '../../dto';
import { CustomerRepository } from '../../repositories';
import { toCustomerResponse } from '../../utils/customer/to-customer-response';

@Injectable()
export class CustomerQueryService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async getCustomers(): Promise<CustomerResponseDto[]> {
    const customers = await this.customerRepository.find({});
    return customers.map((customer) => toCustomerResponse(customer));
  }
}
