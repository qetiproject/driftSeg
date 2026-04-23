import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import * as segmentRule from './create-segment/segment-rule';

export class SegmentRulesDto {
  @IsEnum(segmentRule.SegmentRuleKind)
  kind!: segmentRule.SegmentRuleKind;

  @IsInt()
  days!: number;
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
