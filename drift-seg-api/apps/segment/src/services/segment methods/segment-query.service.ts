import { Injectable } from '@nestjs/common';
import { PaginatedSegmentResponseDto } from '@segment/dto/paginated-segment-response.dto';
import { SegmentDeltaResponseDto } from '@segment/dto/responses/segment-delta-response.dto';
import { SegmentMembersResponseDto } from '@segment/dto/responses/segment-members-response.dto';
import { SegmentDocument } from '@segment/models/segment.schema';
import { SegmentDeltaRepository } from '@segment/repositories/segment-delta.repository';
import { SegmentRepository } from '@segment/repositories/segment.repository';
import { isSegmentRuleInput } from '@segment/utils/segment-membership.helper';
import {
  getSegmentById,
  getSegmentDeltas,
  toSegmentResponse,
} from '@segment/utils/segment.helper';
import { SegmentWithMembersFacade } from '../facades/segment-with-members.facade';

@Injectable()
export class SegmentQueryService {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly segmentWithMembersFacade: SegmentWithMembersFacade,
  ) {}

  async getSegmentsWithPagination(
    page = 1,
    limit = 10,
  ): Promise<PaginatedSegmentResponseDto> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    const skip = (safePage - 1) * safeLimit;

    const filter = {};

    const [segments, totalItems] = await Promise.all([
      this.segmentRepository.getSegments(skip, safeLimit, filter),
      this.segmentRepository.countDocuments(filter),
    ]);

    return {
      items: segments.map(toSegmentResponse),
      totalItems,
      totalPages: Math.ceil(totalItems / safeLimit),
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
    await getSegmentById(this.segmentRepository, segmentId);

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

  async getValidDynamicSegments(): Promise<SegmentDocument[]> {
    const dynamicSegments = await this.segmentRepository.getDynamicSegments();

    return dynamicSegments.filter((segment) =>
      isSegmentRuleInput(segment.rules),
    );
  }
}
