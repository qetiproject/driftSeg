import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { CreateCustomerDto } from '@customer/dto/customer/create-customer.dto';
import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsOptional()
  @IsNumber()
  totalSpent?: number;

  @IsOptional()
  @IsEnum(CustomerStatusEnum)
  status?: CustomerStatusEnum;
}
