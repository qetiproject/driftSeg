import { Injectable } from '@nestjs/common';
import { toSegmentResponse } from '@segment/utils';
import { SegmentTypeEnum } from '../dto';
import { CreateSegmentDto } from '../dto/request';
import {
  SegmentMembersResponseDto,
  SegmentResponseDto,
} from '../dto/responses';
import { CreateSegmentFacade } from './facades/create-segment.facade';
import { SegmentWithMembersFacade } from './facades/segment-with-members.facade';
import { SegmentMembershipService } from './segment-membership.service';

@Injectable()
export class SegmentService {
  constructor(
    private readonly createSegmentFacade: CreateSegmentFacade,
    private readonly segmentWithMembersFacade: SegmentWithMembersFacade,
    private readonly segmentMembershipService: SegmentMembershipService,
  ) {}

  async createSegment(payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    const created = await this.createSegmentFacade.createSegment(payload);

    if (created.type === SegmentTypeEnum.STATIC) {
      await this.segmentMembershipService.refreshStaticSegmentMemberships(created);
    }

    return toSegmentResponse(created);
  }

  async getSegmentMembers(
    segmentId: string,
  ): Promise<SegmentMembersResponseDto> {
    return this.segmentWithMembersFacade.getSegmentWithMembers(segmentId);
  }

  // async getSegmentDeltas(
  //   segmentId: string,
  // ): Promise<SegmentDeltaResponseDto[]> {
  //   await getSegmentById(this.segmentRepository, segmentId);
  //   const deltas = await getSegmentDeltas(
  //     this.segmentDeltaRepository,
  //     segmentId,
  //   );

  //   return deltas.map((delta) => ({
  //     _id: delta._id.toString(),
  //     segmentId: delta.segmentId.toString(),
  //     segmentkind: delta.segmentkind,
  //     addedCustomerIds: (delta.addedCustomerIds ?? []).map((id) =>
  //       id.toString(),
  //     ),
  //     removedCustomerIds: (delta.removedCustomerIds ?? []).map((id) =>
  //       id.toString(),
  //     ),
  //     triggerEventId: delta.triggerEventId,
  //     triggerEventType: delta.triggerEventType,
  //     computedAt: delta.computedAt.toISOString(),
  //   }));
  // }

  // async refreshStaticSegment(segmentId: string): Promise<void> {
  //   const segment = await getSegmentById(this.segmentRepository, segmentId);
  //   if (segment.type !== SegmentTypeEnum.STATIC) {
  //     return;
  //   }

  //   await this.segmentMembershipService.refreshStaticSegmentMemberships(
  //     segment,
  //   );
  // }

  // async deleteSegmentCascade(segmentId: string): Promise<void> {
  //   await this.deleteSegmentRecursive(segmentId, new Set<string>());
  // }

  // private async deleteSegmentRecursive(
  //   segmentId: string,
  //   visited: Set<string>,
  // ): Promise<void> {
  //   if (visited.has(segmentId)) {
  //     return;
  //   }
  //   visited.add(segmentId);

  //   const segmentObjectId = new Types.ObjectId(segmentId);
  //   const dependents =
  //     await this.segmentRepository.findDependentsBySegmentId(segmentObjectId);

  //   for (const dependent of dependents) {
  //     await this.deleteSegmentRecursive(dependent._id.toString(), visited);
  //   }

  //   await this.segmentMembershipRepository.deleteBySegmentId(segmentObjectId);
  //   await this.segmentDeltaRepository.deleteBySegmentId(segmentObjectId);
  //   await this.segmentRepository.findOneAndDelete({ _id: segmentId });
  // }
}
