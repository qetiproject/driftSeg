import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { CustomerDocument } from '@app/common/models';
import { CustomerResponseDto } from '../../dto';

export function toCustomerResponse(
  customer: CustomerDocument,
): CustomerResponseDto {
  return {
    _id: customer._id.toString(),
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    totalSpent: customer.totalSpent ?? 0,
    status: customer.status ?? CustomerStatusEnum.INACTIVE,
  };
}
