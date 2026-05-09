import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SegmentRuleKind } from '@segment/dto/segment-rule';
import { SegmentMembershipDocument } from '@segment/models';
import { Types } from 'mongoose';

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

export type SegmentMemberWithCustomer = SegmentMembershipDocument &
  CustomerForSegment;

export type CustomerForSegment = {
  customerId:
    | Types.ObjectId
    | {
        _id: Types.ObjectId;
        email?: string;
      };
};
