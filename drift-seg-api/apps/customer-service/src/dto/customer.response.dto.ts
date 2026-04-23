import { CustomerStatusEnum } from '@app/common/enum/status.enum';

export interface CustomerResponseDto {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalSpent: number;
  status: CustomerStatusEnum;
}
