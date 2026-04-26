import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: '680baf22a9d7a5946a2d06c1' })
  @IsMongoId()
  customerId!: string;

  @ApiProperty({ example: 250, minimum: 1 })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ example: '2026-04-25T11:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ApiPropertyOptional({ example: 'First payment from referral campaign' })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  description?: string;
}
