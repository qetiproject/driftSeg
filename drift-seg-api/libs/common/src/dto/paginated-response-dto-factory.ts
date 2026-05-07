import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function PaginatedResponseDtoFactory<T>(classRef: Type<T>) {
  class PaginatedResponseDto {
    @ApiProperty({ type: classRef, isArray: true })
    items!: T[];

    @ApiProperty({ example: 125 })
    totalItems!: number;

    @ApiProperty({ example: 13 })
    totalPages!: number;

    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 10 })
    limit!: number;
  }

  return PaginatedResponseDto;
}
