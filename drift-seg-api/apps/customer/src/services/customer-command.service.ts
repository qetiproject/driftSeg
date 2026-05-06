import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { CUSTOMER_ERROR_MESSAGES } from '@customer/constants/error-messages';
import { CreateCustomerDto } from '@customer/dto';
import { CustomerRepository } from '@customer/repositories/customer.repository';
import { toCustomerResponse } from '@customer/utils';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class CustomerCommandService {
  constructor(private readonly customerRepository: CustomerRepository) {}

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
}
