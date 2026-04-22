import { Injectable } from '@nestjs/common';
import {
  SegmentDeltaDocument,
  SegmentDocument,
  SegmentMembershipDocument,
} from '../models';
import { SegmentDeltaRepository } from '../repositories/segment-delta.repository';
import { SegmentMembershipRepository } from '../repositories/segment-membership.repository';
import { SegmentRepository } from '../repositories/segment.repository';

@Injectable()
export class SegmentQueryService {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
  ) {}

  async listSegments(): Promise<SegmentDocument[]> {
    return await this.segmentRepository.find({});
  }

  async listSegmentMemberships(
    segmentId: string,
  ): Promise<SegmentMembershipDocument[]> {
    return await this.segmentMembershipRepository.find({ segmentId });
  }

  async listSegmentDeltas(segmentId: string): Promise<SegmentDeltaDocument[]> {
    return await this.segmentDeltaRepository.find({ segmentId });
  }
}
