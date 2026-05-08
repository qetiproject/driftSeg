import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as segmentRule from '@segment/dto/segment-rule';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class SegmentRulesDto {
  @ApiProperty({ enum: segmentRule.SegmentRuleKind })
  @IsEnum(segmentRule.SegmentRuleKind)
  kind!: segmentRule.SegmentRuleKind;

  @ApiPropertyOptional({ example: 30 })
  @ValidateIf(
    (rules: SegmentRulesDto) =>
      rules.kind === segmentRule.SegmentRuleKind.ACTIVE_BUYERS ||
      rules.kind === segmentRule.SegmentRuleKind.VIP,
  )
  @IsDefined()
  @IsInt()
  days!: number;

  @ApiPropertyOptional({ example: 1000, minimum: 1 })
  @ValidateIf(
    (rules: SegmentRulesDto) => rules.kind === segmentRule.SegmentRuleKind.VIP,
  )
  @IsDefined()
  @IsInt()
  @Min(1)
  minSpend?: number;

  @ApiPropertyOptional({ example: 45, minimum: 1 })
  @ValidateIf(
    (rules: SegmentRulesDto) => rules.kind === segmentRule.SegmentRuleKind.RISK,
  )
  @IsDefined()
  @IsInt()
  @Min(1)
  inActiveDays?: number;
}

export class CreateSegmentDto {
  @ApiProperty({ example: 'VIP users - last 60 days' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ enum: segmentRule.SegmentTypeEnum })
  @IsEnum(segmentRule.SegmentTypeEnum)
  type!: segmentRule.SegmentTypeEnum;

  @ApiProperty({ type: () => SegmentRulesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SegmentRulesDto)
  rules!: SegmentRulesDto;

  @ApiPropertyOptional({
    type: [String],
    example: ['680baf22a9d7a5946a2d06c2', '680baf22a9d7a5946a2d06c3'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  dependsOnSegmentIds?: string[];

  @ApiPropertyOptional({ example: 'manual_upload' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  staticSegmentKind?: string;
}

export type CreateSegmentWithRulesDto = CreateSegmentDto & {
  rules: SegmentRulesDto;
};
