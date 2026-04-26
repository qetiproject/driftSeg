export interface SegmentResponse {
  _id: string;
  name: string;
  type: SegmentTypeEnum;
  rules: SegmentRules;
  dependsOnSegmentIds: string[];
  staticSegmentKind?: string;
}
export type CreateSegmentRequest = Omit<SegmentResponse, '_id' | 'dependsOnSegmentIds'> & {
  dependsOnSegmentIds?: string[];
};

export enum SegmentTypeEnum {
  Dynamic = 'dynamic',
  Static = 'static',
}

export interface SegmentRules {
  kind: SegmentkindEnum;
  days?: number;
  minSpend?: number;
  inActiveDays?: number;
}

export enum SegmentkindEnum {
  ACTIVE_BUYERS = 'active_buyers',
  VIP = 'vip',
  RISK = 'risk',
}

export interface SegmentMember {
  customerId: string;
  customerEmail: string;
}

export interface SegmentMembersResponse {
  segmentId: string;
  segmentkind?: SegmentkindEnum;
  staticSegmentKind?: string;
  totalMembers: number;
  members: SegmentMember[];
}

export interface SegmentDeltaResponse {
  _id: string;
  segmentId: string;
  segmentkind: SegmentkindEnum;
  addedCustomerIds: string[];
  removedCustomerIds: string[];
  triggerEventId: string;
  triggerEventType: string;
  computedAt: string;
}
