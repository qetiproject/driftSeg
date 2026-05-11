import { Injectable } from '@nestjs/common';
import { CreateSegmentDto } from '@segment/dto';
import { SegmentResponseDto } from '@segment/dto/responses/segment-response.dto';
import {
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from '@segment/repositories';
import { CreateSegmentFacade } from '@segment/services';
import { toSegmentResponse } from '@segment/utils';
import { Types } from 'mongoose';

@Injectable()
export class SegmentCommandService {
  constructor(
    private readonly createSegmentFacade: CreateSegmentFacade,
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
  ) {}

  async createSegment(payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    const created = await this.createSegmentFacade.createSegment(payload);

    // if (created.type === SegmentTypeEnum.STATIC) {
    //   await this.segmentMembershipService.refreshStaticSegmentMemberships(
    //     created,
    //   );
    // }

    return toSegmentResponse(created);
  }

  async deleteSegmentCascade(segmentId: string): Promise<void> {
    await this.deleteSegmentRecursive(segmentId, new Set<string>());
  }

  private async deleteSegmentRecursive(
    segmentId: string,
    visited: Set<string>,
  ): Promise<void> {
    if (visited.has(segmentId)) {
      return;
    }
    visited.add(segmentId);

    const segmentObjectId = new Types.ObjectId(segmentId);
    const dependents =
      await this.segmentRepository.findDependentsBySegmentId(segmentObjectId);

    for (const dependent of dependents) {
      await this.deleteSegmentRecursive(dependent._id.toString(), visited);
    }

    await this.segmentMembershipRepository.deleteMembersBySegmentId(
      segmentObjectId,
    );
    await this.segmentDeltaRepository.deleteDeltasBySegmentId(segmentObjectId);
    await this.segmentRepository.deleteSegmentById(segmentId);
  }
}
