import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsMongoId()
  customerId!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsDateString()
  occurredAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  description?: string;
}
