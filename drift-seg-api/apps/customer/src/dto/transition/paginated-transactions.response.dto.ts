import { TransactionResponseDto } from '@customer/dto/transition/transaction.response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedTransactionsResponseDto {
  @ApiProperty({ type: TransactionResponseDto, isArray: true })
  items!: TransactionResponseDto[];

  @ApiProperty({ example: 250 })
  totalItems!: number;

  @ApiProperty({ example: 25 })
  totalPages!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;
}
