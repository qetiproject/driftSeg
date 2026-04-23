import { CustomerStatusEnum } from '@app/common/models';
import type { CustomerDocument } from '@app/common/models';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto, CustomerResponseDto } from './dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    await this.validateCreateCustomerDto(createCustomerDto);
    const created = await this.customerRepository.create({
      ...createCustomerDto,
      totalSpent: 0,
      status: CustomerStatusEnum.INACTIVE,
    });
    return this.toCustomerResponse(created);
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

  async findAll(): Promise<CustomerResponseDto[]> {
    const customers = await this.customerRepository.find({});
    return customers.map((customer) => this.toCustomerResponse(customer));
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

  private toCustomerResponse(customer: CustomerDocument): CustomerResponseDto {
    return {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      totalSpent: customer.totalSpent ?? 0,
      status: customer.status ?? CustomerStatusEnum.INACTIVE,
    };
  }
}
