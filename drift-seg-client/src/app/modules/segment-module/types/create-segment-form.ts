import { SegmentTypeEnum, SegmentkindEnum } from '.';

export interface CreateSegmentForm {
  name: string;
  type: SegmentTypeEnum;
  ruleKind: SegmentkindEnum;
  days: string;
  minSpend: string;
  inActiveDays: string;
  dependsOnSegmentIds: string;
  staticSegmentKind?: string;
}
