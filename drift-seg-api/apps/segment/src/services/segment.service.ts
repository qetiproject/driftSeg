import { Injectable } from '@nestjs/common';
import { SegmentDeltaRepository } from '@segment/repositories/segment-delta.repository';
import { SegmentMembershipRepository } from '@segment/repositories/segment-membership.repository';
import { SegmentRepository } from '@segment/repositories/segment.repository';
import { SegmentMembershipService } from './segment-membership.service';

@Injectable()
export class SegmentService {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentMembershipService: SegmentMembershipService,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
  ) {}

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
}
