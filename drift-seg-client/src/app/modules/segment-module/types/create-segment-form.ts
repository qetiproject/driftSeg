import { SegmentRules, SegmentTypeEnum } from '.';

export interface CreateSegmentForm {
  name: string;
  type: SegmentTypeEnum;
  rules: SegmentRules;
  dependsOnSegmentIds?: string[];
  staticSegmentKind?: string;
}
