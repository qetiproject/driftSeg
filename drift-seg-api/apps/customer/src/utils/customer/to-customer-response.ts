import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { CustomerMapperInput } from '@customer/dto/customer/customer-mapper-input';
import { CustomerResponseDto } from '@customer/dto/customer/customer.response.dto';

export function toCustomerResponse(
  customer: CustomerMapperInput,
): CustomerResponseDto {
  const id = customer.id ?? customer._id?.toString() ?? '';

  return {
    id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    totalSpent: customer.totalSpent ?? 0,
    status: customer.status ?? CustomerStatusEnum.INACTIVE,
  };
}
