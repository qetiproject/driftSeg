import { SegmentRuleKind } from '../segment-rule';

export interface SegmentMemberDto {
  customerId: string;
}

export interface SegmentMembersResponseDto {
  segmentId: string;
  segmentkind: SegmentRuleKind;
  totalMembers: number;
  members: SegmentMemberDto[];
}
