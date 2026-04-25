import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as segmentRule from '../segment-rule';

export class SegmentResponseDto {
  @ApiProperty({ example: '680baf22a9d7a5946a2d06c2' })
  _id!: string;

  @ApiProperty({ example: 'VIP users - last 60 days' })
  name!: string;

  @ApiProperty({ enum: segmentRule.SegmentTypeEnum })
  type!: segmentRule.SegmentTypeEnum;

  @ApiPropertyOptional({ example: { kind: 'vip', days: 60, minSpend: 1000 } })
  rules?: segmentRule.SegmentRuleInput;

  @ApiPropertyOptional({ example: 'manual_upload' })
  staticSegmentKind?: string;

  @ApiProperty({ type: [String], example: ['680baf22a9d7a5946a2d06c3'] })
  dependsOnSegmentIds!: string[];

  @ApiPropertyOptional({ example: '2026-04-25T11:30:00.000Z' })
  lastComputedAt?: string;

  @ApiPropertyOptional({ example: '2026-04-25T10:00:00.000Z' })
  createdAt?: string;

  @ApiPropertyOptional({ example: '2026-04-25T11:35:00.000Z' })
  updatedAt?: string;
}
