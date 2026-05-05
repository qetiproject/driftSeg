import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { CustomerDocument } from '@app/common/models';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CUSTOMER_ERROR_MESSAGES } from '../constants/error-messages';
import {
  CreateCustomerDto,
  CustomerResponseDto,
  UpdateCustomerDto,
} from '../dto';
import { CustomerRepository, TransactionRepository } from '../repositories';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async createCustomer(
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
    throw new UnprocessableEntityException(
      CUSTOMER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
    );
  }

  async getCustomers(): Promise<CustomerResponseDto[]> {
    const customers = await this.customerRepository.find({});
    return customers.map((customer) => this.toCustomerResponse(customer));
  }

  async getCustomerById(_id: string) {
    return await this.customerRepository.findOne({ _id });
  }

  async updateCustomer(_id: string, updateCustomerDto: UpdateCustomerDto) {
    return await this.customerRepository.findOneAndUpdate(
      { _id },
      { $set: updateCustomerDto },
    );
  }

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

  private toCustomerResponse(customer: CustomerDocument): CustomerResponseDto {
    return {
      _id: customer._id.toString(),
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      totalSpent: customer.totalSpent ?? 0,
      status: customer.status ?? CustomerStatusEnum.INACTIVE,
    };
  }
}
