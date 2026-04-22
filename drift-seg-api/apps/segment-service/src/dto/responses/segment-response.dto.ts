import { SegmentRuleInput } from '../create-segment.dto';
import { SegmentType } from '../enums/segment.enum';

export interface SegmentResponseDto {
  _id: string;
  name: string;
  type: SegmentType;
  rules: SegmentRuleInput;
  dependsOnSegmentIds: string[];
  isActive: boolean;
  lastComputedAt: string;
  createdAt: string;
  updatedAt: string;
}
