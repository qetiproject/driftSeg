export interface SegmentMemberDto {
  customerId: string;
}

export interface SegmentMembersResponseDto {
  segmentId: string;
  totalMembers: number;
  members: SegmentMemberDto[];
}
