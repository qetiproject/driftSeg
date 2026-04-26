export interface SegmentResponse {
  name: string;
  type: SegmentTypeEnum;
  rules: SegmentRules;
  dependsOnSegmentIds: string[];
  staticSegmentKind?: string;
}
export interface CreateSegmentRequest extends SegmentResponse {}

export enum SegmentTypeEnum {
  Dynamic = 'dynamic',
  Static = 'static',
}

export interface SegmentRules {
  kind: SegmentkindEnum;
  days?: number;
  minSpend: number;
  inActiveDays: number;
}

export enum SegmentkindEnum {
  ACTIVE_BUYERS = 'active_buyers',
  VIP = 'vip',
  RISK = 'risk',
}
