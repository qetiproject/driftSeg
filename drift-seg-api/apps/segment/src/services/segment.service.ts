import { CustomerRepository } from '@customer/repositories/customer.repository';
import { Injectable } from '@nestjs/common';
import {
  getSegmentById,
  getSegmentMembers,
  segmentMembersInfo,
  toSegmentResponse,
} from '@segment/utils';
import { CreateSegmentDto } from '../dto/request';
import {
  SegmentMembersResponseDto,
  SegmentResponseDto,
} from '../dto/responses';
import {
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from '../repositories';
import { CreateSegmentFacade } from './facades/create-segment.facade';
import { SegmentMembershipService } from './segment-membership.service';

@Injectable()
export class SegmentService {
  constructor(
    private readonly createSegmentFacade: CreateSegmentFacade,
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly segmentMembershipService: SegmentMembershipService,
  ) {}

  async createSegment(payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    const created = await this.createSegmentFacade.createSegment(payload);
    return toSegmentResponse(created);
  }

  async getSegmentMembers(
    segmentId: string,
  ): Promise<SegmentMembersResponseDto> {
    const segment = await getSegmentById(this.segmentRepository, segmentId);
    const members = await getSegmentMembers(
      this.segmentMembershipRepository,
      segmentId,
    );
    const membersWithEmail = await segmentMembersInfo(
      this.customerRepository,
      members,
    );

    return {
      segmentId: segment._id.toString(),
      segmentkind: segment.rules?.kind,
      staticSegmentKind: segment.staticSegmentKind,
      totalMembers: members.length,
      members: membersWithEmail,
    };
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
