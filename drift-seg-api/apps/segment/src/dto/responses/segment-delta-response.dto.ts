import { SegmentRuleKind } from '../segment-rule';
import { ApiProperty } from '@nestjs/swagger';

export class SegmentDeltaResponseDto {
  @ApiProperty({ example: '680baf22a9d7a5946a2d06c4' })
  _id!: string;

  @ApiProperty({ example: '680baf22a9d7a5946a2d06c2' })
  segmentId!: string;

  @ApiProperty({ enum: SegmentRuleKind })
  segmentkind!: SegmentRuleKind;

  @ApiProperty({ type: [String], example: ['680baf22a9d7a5946a2d06c1'] })
  addedCustomerIds!: string[];

  @ApiProperty({ type: [String], example: ['680baf22a9d7a5946a2d06c5'] })
  removedCustomerIds!: string[];

  @ApiProperty({ example: 'txn:680baf22a9d7a5946a2d06c8' })
  triggerEventId!: string;

  @ApiProperty({ example: 'TRANSACTION_CREATED' })
  triggerEventType!: string;

  @ApiProperty({ example: '2026-04-25T11:30:00.000Z' })
  computedAt!: string;
}
