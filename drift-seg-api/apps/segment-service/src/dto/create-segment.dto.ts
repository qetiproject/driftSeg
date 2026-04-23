import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import type { SegmentRuleInput } from './create-segment/segment-rule';
import * as segmentRule from './create-segment/segment-rule';

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
  rules!: SegmentRuleInput;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  dependsOnSegmentIds?: string[];
}
