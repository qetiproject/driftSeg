import { SegmentRuleInput } from '../request';
import { SegmentTypeEnum } from '../segment-rule';

export interface SegmentResponseDto {
  _id: string;
  name: string;
  type: SegmentTypeEnum;
  rules: SegmentRuleInput;
  dependsOnSegmentIds: string[];
  lastComputedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
