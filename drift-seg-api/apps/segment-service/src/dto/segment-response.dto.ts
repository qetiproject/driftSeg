import { SegmentTypeEnum } from '../models';
import { SegmentRuleInput } from './create-segment.dto';

export class SegmentResponseDto {
  _id!: string;
  name!: string;
  type!: SegmentTypeEnum;
  rules!: SegmentRuleInput;
  dependsOnSegmentIds!: string[];
  isActive!: boolean;
  lastComputedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
