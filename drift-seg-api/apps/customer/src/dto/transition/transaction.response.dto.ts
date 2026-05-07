import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({ example: '680baf22a9d7a5946a2d06c2' })
  id!: string;

  @ApiProperty({ example: '680baf22a9d7a5946a2d06c1' })
  customerId!: string;

  @ApiProperty({ example: 250 })
  amount!: number;

  @ApiProperty({ example: '2026-04-25T11:30:00.000Z' })
  occurredAt!: string;

  @ApiPropertyOptional({ example: 'First payment from referral campaign' })
  description?: string;
}
