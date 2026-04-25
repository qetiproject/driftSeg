import { SegmentRuleInput, SegmentTypeEnum } from '../segment-rule';

export interface SegmentResponseDto {
  _id: string;
  name: string;
  type: SegmentTypeEnum;
  rules?: SegmentRuleInput;
  staticSegmentKind?: string;
  dependsOnSegmentIds: string[];
  lastComputedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
