import { SegmentRuleKind } from '../segment-rule';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SegmentMemberDto {
  @ApiProperty({ example: '680baf22a9d7a5946a2d06c1' })
  customerId!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  customerEmail!: string;
}

export class SegmentMembersResponseDto {
  @ApiProperty({ example: '680baf22a9d7a5946a2d06c2' })
  segmentId!: string;

  @ApiPropertyOptional({ enum: SegmentRuleKind })
  segmentkind?: SegmentRuleKind;

  @ApiPropertyOptional({ example: 'manual_upload' })
  staticSegmentKind?: string;

  @ApiProperty({ example: 24 })
  totalMembers!: number;

  @ApiProperty({ type: [SegmentMemberDto] })
  members!: SegmentMemberDto[];
}
