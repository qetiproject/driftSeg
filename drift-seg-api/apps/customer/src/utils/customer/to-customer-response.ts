import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { CustomerDocument } from '@app/common/models';
import { CustomerResponseDto } from '@customer/dto/customer/customer.response.dto';

export function toCustomerResponse(
  customer: CustomerDocument,
): CustomerResponseDto {
  return {
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    totalSpent: customer.totalSpent ?? 0,
    status: customer.status ?? CustomerStatusEnum.INACTIVE,
  };
}
