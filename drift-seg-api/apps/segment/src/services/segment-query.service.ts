import { Injectable } from '@nestjs/common';
import { PaginatedSegmentResponseDto } from '@segment/dto/paginated-segment-response.dto';
import { SegmentMembersResponseDto } from '@segment/dto/responses/segment-members-response.dto';
import { SegmentRepository } from '@segment/repositories/segment.repository';
import { SegmentWithMembersFacade } from '@segment/services/facades/segment-with-members.facade';
import { toSegmentResponse } from '@segment/utils/segment.helper';

@Injectable()
export class SegmentQueryService {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentWithMembersFacade: SegmentWithMembersFacade,
  ) {}

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

  async getSegmentMembers(
    segmentId: string,
  ): Promise<SegmentMembersResponseDto> {
    return this.segmentWithMembersFacade.getSegmentWithMembers(segmentId);
  }
}
