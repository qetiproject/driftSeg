import { SegmentTypeEnum } from '../models';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { SegmentRuleKind } from './rule-kinds';
import { IsValidSegmentRuleConstraint } from './rules.validator';

export interface SegmentRuleInput {
  kind: SegmentRuleKind;
  [key: string]: unknown;
}

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEnum(SegmentTypeEnum)
  type!: SegmentTypeEnum;

  @IsObject()
  @Validate(IsValidSegmentRuleConstraint)
  rules!: SegmentRuleInput;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  dependsOnSegmentIds?: string[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
