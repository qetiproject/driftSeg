import { Injectable } from '@nestjs/common';
import {
  CustomerForSegment,
  SegmentMembersResponseDto,
} from '@segment/dto/responses/segment-members-response.dto';
import {
  SegmentMembershipRepository,
  SegmentRepository,
} from '@segment/repositories';
import { getSegmentById } from '@segment/utils/segment.helper';
import { Types } from 'mongoose';

@Injectable()
export class SegmentWithMembersFacade {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
  ) {}

  async getSegmentWithMembers(
    segmentId: string,
  ): Promise<SegmentMembersResponseDto> {
    const segment = await getSegmentById(this.segmentRepository, segmentId);
    const membersWithCustomer =
      await this.getSegmentMembersWithCustomer(segmentId);
    const membersWithEmail = this.mapMembers(membersWithCustomer);

    return {
      segmentId: segment._id.toString(),
      segmentkind: segment.rules?.kind,
      staticSegmentKind: segment.staticSegmentKind,
      totalMembers: membersWithCustomer.length,
      members: membersWithEmail,
    };
  }

  private getSegmentMembersWithCustomer(segmentId: string) {
    return this.segmentMembershipRepository.findActiveMembersWithCustomerBySegmentId(
      new Types.ObjectId(segmentId),
      { fullCustomerData: false },
    );
  }

  private mapMembers(
    membersWithCustomer: CustomerForSegment[],
  ): SegmentMembersResponseDto['members'] {
    return membersWithCustomer.map((member) => {
      if (member.customerId instanceof Types.ObjectId) {
        return {
          customerId: member.customerId.toString(),
          customerEmail: 'Unknown',
        };
      }

      return {
        customerId: member.customerId._id.toString(),
        customerEmail: member.customerId.email || 'Unknown',
      };
    });
  }
}
