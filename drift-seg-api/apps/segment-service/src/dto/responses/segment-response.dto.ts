import { SegmentRuleInput } from '../create-segment';
import { SegmentTypeEnum } from '../create-segment/segment-rule';

export interface SegmentResponseDto {
  _id: string;
  name: string;
  type: SegmentTypeEnum;
  rules: SegmentRuleInput;
  dependsOnSegmentIds: string[];
  isActive: boolean;
  lastComputedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
