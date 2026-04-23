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
import * as segmentRule from './create-segment/segment-rule';

export class SegmentRulesDto {
  @IsEnum(segmentRule.SegmentRuleKind)
  kind!: segmentRule.SegmentRuleKind;

  @ValidateIf(
    (rules: SegmentRulesDto) =>
      rules.kind === segmentRule.SegmentRuleKind.ACTIVE_BUYERS ||
      rules.kind === segmentRule.SegmentRuleKind.VIP,
  )
  @IsDefined()
  @IsInt()
  days!: number;

  @ValidateIf(
    (rules: SegmentRulesDto) => rules.kind === segmentRule.SegmentRuleKind.VIP,
  )
  @IsDefined()
  @IsInt()
  @Min(1)
  minSpend?: number;

  @ValidateIf(
    (rules: SegmentRulesDto) => rules.kind === segmentRule.SegmentRuleKind.RISK,
  )
  @IsDefined()
  @IsInt()
  @Min(1)
  inActiveDays?: number;
}

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEnum(segmentRule.SegmentTypeEnum)
  type!: segmentRule.SegmentTypeEnum;

  @IsObject()
  @ValidateNested()
  @Type(() => SegmentRulesDto)
  rules!: SegmentRulesDto;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  dependsOnSegmentIds?: string[];
}
