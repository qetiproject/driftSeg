import { CustomerStatusEnum } from '@app/common/models';

export interface CustomerResponseDto {
  firstName: string;
  lastName: string;
  email: string;
  totalSpent: number;
  status: CustomerStatusEnum;
}
