import { StatusEnum } from '@app/common/models';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsNumber()
  @Type(() => Number)
  totalSpent!: number;

  @IsDate()
  @Type(() => Date)
  lastTransactionDate!: Date;

  @IsEnum(StatusEnum)
  status!: StatusEnum;
}
