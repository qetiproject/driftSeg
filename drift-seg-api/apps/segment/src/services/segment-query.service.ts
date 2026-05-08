import { Injectable } from '@nestjs/common';
import { toSegmentResponse } from '@segment/utils';
import { PaginatedSegmentResponseDto } from '../dto/paginated-segment-response.dto';
import { SegmentRepository } from '../repositories';

@Injectable()
export class SegmentQueryService {
  constructor(private readonly segmentRepository: SegmentRepository) {}

  async getSegments(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedSegmentResponseDto> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;
    const filter = {};

    const segments = await this.segmentRepository.find(filter, {
      skip,
      limit: safeLimit,
    });

    const totalItems = await this.segmentRepository.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / safeLimit);

    return {
      items: segments.map(toSegmentResponse),
      totalItems,
      totalPages,
      page: safePage,
      limit: safeLimit,
    };
  }
}
