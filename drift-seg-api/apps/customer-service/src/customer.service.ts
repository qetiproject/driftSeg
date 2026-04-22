import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto } from './dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      return this.customerRepository.create(createCustomerDto);
    } catch (error: any) {
      console.error(error);
      throw new Error('Payment failed. Customer was not created.');
    }
  }

  async findAll() {
    return await this.customerRepository.find({});
  }

  async findOne(_id: string) {
    return await this.customerRepository.findOne({ _id });
  }

  async update(_id: string, updateCustomerDto: UpdateCustomerDto) {
    return await this.customerRepository.findOneAndUpdate(
      { _id },
      { $set: updateCustomerDto },
    );
  }

  async remove(_id: string) {
    const deletedCustomer = await this.customerRepository.findOneAndDelete({
      _id,
    });
    if (!deletedCustomer) {
      throw new NotFoundException('Customer was not found');
    }
    return deletedCustomer;
  }
}
