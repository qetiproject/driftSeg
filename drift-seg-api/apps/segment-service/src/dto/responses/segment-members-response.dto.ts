import { SegmentRuleKind } from '../segment-rule';

export interface SegmentMemberDto {
  customerId: string;
  customerEmail: string;
}

export interface SegmentMembersResponseDto {
  segmentId: string;
  segmentkind?: SegmentRuleKind;
  staticSegmentKind?: string;
  totalMembers: number;
  members: SegmentMemberDto[];
}
