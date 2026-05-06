import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { Types } from 'mongoose';

export type CustomerMapperInput = {
  id?: string;
  _id?: string | Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  totalSpent?: number;
  status?: CustomerStatusEnum;
};
