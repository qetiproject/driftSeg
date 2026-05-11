import { Injectable, NotFoundException } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '@segment/constants/error-messages';
import { PaginatedSegmentResponseDto } from '@segment/dto/paginated-segment-response.dto';
import { SegmentDeltaResponseDto } from '@segment/dto/responses/segment-delta-response.dto';
import { SegmentMembersResponseDto } from '@segment/dto/responses/segment-members-response.dto';
import {
  SegmentDeltaRepository,
  SegmentRepository,
} from '@segment/repositories';
import { SegmentWithMembersFacade } from '@segment/services/facades/segment-with-members.facade';
import {
  getSegmentDeltas,
  toSegmentResponse,
} from '@segment/utils/segment.helper';

@Injectable()
export class SegmentQueryService {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
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

  async getSegmentWithMembers(
    segmentId: string,
  ): Promise<SegmentMembersResponseDto> {
    return this.segmentWithMembersFacade.getSegmentWithMembers(segmentId);
  }

  async getSegmentDeltas(
    segmentId: string,
  ): Promise<SegmentDeltaResponseDto[]> {
    const segment = await this.segmentRepository.findOne({ _id: segmentId });
    if (!segment) {
      throw new NotFoundException(SEGMENT_ERROR_MESSAGES.SEGMENT_NOT_FOUND);
    }

    const deltas = await getSegmentDeltas(
      this.segmentDeltaRepository,
      segmentId,
    );

    return deltas.map((delta) => ({
      _id: delta._id.toString(),
      segmentId: delta.segmentId.toString(),
      segmentkind: delta.segmentkind,
      addedCustomerIds: (delta.addedCustomerIds ?? []).map((id) =>
        id.toString(),
      ),
      removedCustomerIds: (delta.removedCustomerIds ?? []).map((id) =>
        id.toString(),
      ),
      triggerEventId: delta.triggerEventId,
      triggerEventType: delta.triggerEventType,
      computedAt: delta.computedAt.toISOString(),
    }));
  }
}
