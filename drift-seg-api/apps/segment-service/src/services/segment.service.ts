import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { SegmentDocument } from '../models';

import {
  CreateSegmentDto,
  SegmentDeltaResponseDto,
  SegmentMembersResponseDto,
  SegmentResponseDto,
} from '../dto';
import {
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from '../repositories';
import { CreateSegmentFacade } from './create-segment.facade';

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
    return this.toSegmentResponse(created);
  }

  async getAllSegments(): Promise<SegmentResponseDto[]> {
    const segments = await this.segmentRepository.find({});
    return segments.map((segment) => this.toSegmentResponse(segment));
  }

  async getSegmentMembers(
    segmentId: string,
  ): Promise<SegmentMembersResponseDto> {
    const segment = await this.segmentRepository.findOne({ _id: segmentId });
    const memberships =
      await this.segmentMembershipRepository.findActiveMembersBySegmentId(
        new Types.ObjectId(segmentId),
      );

    return {
      segmentId: segment._id.toString(),
      totalMembers: memberships.length,
      members: memberships.map((membership) => ({
        customerId: membership.customerId.toString(),
      })),
    };
  }

  async getSegmentDeltas(
    segmentId: string,
  ): Promise<SegmentDeltaResponseDto[]> {
    await this.segmentRepository.findOne({ _id: segmentId });
    const deltas = await this.segmentDeltaRepository.findBySegmentId(
      new Types.ObjectId(segmentId),
    );

    return deltas.map((delta) => ({
      _id: delta._id.toString(),
      segmentId: delta.segmentId.toString(),
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

  private toSegmentResponse(segment: SegmentDocument): SegmentResponseDto {
    return {
      _id: segment._id.toString(),
      name: segment.name,
      type: segment.type,
      rules: segment.rules,
      dependsOnSegmentIds: (segment.dependsOnSegmentIds ?? []).map((id) =>
        id.toString(),
      ),
      lastComputedAt: segment.lastComputedAt?.toISOString(),
    };
  }
}
