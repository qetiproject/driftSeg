import { Injectable } from '@nestjs/common';
import { CreateSegmentDto } from '../dto/request';
import {
  SegmentDeltaResponseDto,
  SegmentMembersResponseDto,
  SegmentResponseDto,
} from '../dto/responses';
import {
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from '../repositories';
import {
  getSegmentById,
  getSegmentDeltas,
  getSegmentMembers,
  toSegmentResponse,
} from '../utils/helper/segment.helper';
import { CreateSegmentFacade } from './facades/create-segment.facade';

@Injectable()
export class SegmentService {
  constructor(
    private readonly createSegmentFacade: CreateSegmentFacade,
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
  ) {}

  async createSegment(payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    const created = await this.createSegmentFacade.createSegment(payload);
    return toSegmentResponse(created);
  }

  async getAllSegments(): Promise<SegmentResponseDto[]> {
    const segments = await this.segmentRepository.find({});
    return segments.map((segment) => toSegmentResponse(segment));
  }

  async getSegmentMembers(
    segmentId: string,
  ): Promise<SegmentMembersResponseDto> {
    const segment = await getSegmentById(this.segmentRepository, segmentId);
    const members = await getSegmentMembers(
      this.segmentMembershipRepository,
      segmentId,
    );

    return {
      segmentId: segment._id.toString(),
      totalMembers: members.length,
      members: members.map((member) => ({
        customerId: member.customerId.toString(),
      })),
    };
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
}
