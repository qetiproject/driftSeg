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
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import * as segmentRule from './create-segment/segment-rule';

class ActiveBuyersRuleDto implements segmentRule.ActiveBuyersRuleInput {
  @IsEnum(segmentRule.SegmentRuleKind)
  kind!: segmentRule.SegmentRuleKind.ACTIVE_BUYERS;

  @Type(() => Number)
  @IsInt()
  @Min(1)
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
  @Type(() => ActiveBuyersRuleDto)
  rules!: segmentRule.ActiveBuyersRuleInput;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  dependsOnSegmentIds?: string[];
}
