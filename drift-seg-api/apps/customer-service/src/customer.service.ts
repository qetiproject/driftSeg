import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto } from './dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(createCustomerDto: CreateCustomerDto) {
    await this.validateCreateCustomerDto(createCustomerDto);
    return await this.customerRepository.create(createCustomerDto);
  }

  private async validateCreateCustomerDto(
    createCustomerDto: CreateCustomerDto,
  ) {
    try {
      await this.customerRepository.findOne({ email: createCustomerDto.email });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return;
    }
    throw new UnprocessableEntityException('Email already exists.');
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
