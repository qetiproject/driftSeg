import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { CUSTOMER_ERROR_MESSAGES } from '@customer/constants/error-messages';
import {
  CreateCustomerDto,
  CustomerResponseDto,
  UpdateCustomerDto,
} from '@customer/dto';
import { CustomerRepository } from '@customer/repositories/customer.repository';
import { TransactionRepository } from '@customer/repositories/transaction.repository';
import { toCustomerResponse } from '@customer/utils/customer/to-customer-response';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

@Injectable()
export class CustomerCommandService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async createCustomer(dto: CreateCustomerDto) {
    await this.customerByEmail(dto.email);
    const createdCustomer = await this.customerRepository.createCustomer({
      ...dto,
      totalSpent: 0,
      status: CustomerStatusEnum.INACTIVE,
    });
    return toCustomerResponse(createdCustomer);
  }

  private async customerByEmail(email: string): Promise<void> {
    const existingCustomer = await this.customerRepository.findOne({
      email,
    });

    if (existingCustomer) {
      throw new UnprocessableEntityException(
        CUSTOMER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      );
    }
  }

  async updateCustomer(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto | null> {
    const updatedCustomer = await this.customerRepository.updateById(
      id,
      updateCustomerDto,
    );
    return updatedCustomer ? toCustomerResponse(updatedCustomer) : null;
  }

  async addSpentAndRefreshStatus(
    id: string,
    amount: number,
  ): Promise<CustomerResponseDto | null> {
    const updatedCustomer =
      await this.customerRepository.addSpentAndRefreshStatus(id, amount);
    return updatedCustomer ? toCustomerResponse(updatedCustomer) : null;
  }

  async removeCustomer(id: string) {
    const deletedCustomer = await this.customerRepository.findByIdAndDelete(id);

    if (!deletedCustomer) {
      throw new NotFoundException(CUSTOMER_ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    await this.transactionRepository.deleteManyByCustomerId(id);

    return deletedCustomer;
  }
}
