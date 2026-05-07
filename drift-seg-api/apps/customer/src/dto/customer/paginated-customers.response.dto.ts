import { CustomerResponseDto } from '@customer/dto/customer/customer.response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedCustomersResponseDto {
  @ApiProperty({ type: CustomerResponseDto, isArray: true })
  items!: CustomerResponseDto[];

  @ApiProperty({ example: 125 })
  totalItems!: number;

  @ApiProperty({ example: 13 })
  totalPages!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;
}
