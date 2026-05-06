import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email!: string;

  @ApiProperty({ example: 1420.5 })
  totalSpent!: number;

  @ApiProperty({ enum: CustomerStatusEnum, example: CustomerStatusEnum.ACTIVE })
  status!: CustomerStatusEnum;
}
