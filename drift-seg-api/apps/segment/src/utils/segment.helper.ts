import { CustomerRepository } from '@customer/repositories';
import { NotFoundException } from '@nestjs/common';
import { DAY_IN_MS } from '@segment/constants/constants';
import { SegmentMembersResponseDto, SegmentResponseDto } from '@segment/dto';
import { SegmentDocument, SegmentMembershipDocument } from '@segment/models';
import {
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from '@segment/repositories';
import { Types } from 'mongoose';

export function toSegmentResponse(
  segment: SegmentDocument,
): SegmentResponseDto {
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

export function getSegmentById(
  segmentRepository: SegmentRepository,
  segmentId: string,
): Promise<SegmentDocument> {
  return segmentRepository.findOne({ _id: segmentId }).then((segment) => {
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    return segment;
  });
}

export function getSegmentMembers(
  segmentMembershipRepository: SegmentMembershipRepository,
  segmentId: string,
) {
  return segmentMembershipRepository.findActiveMembersBySegmentId(
    new Types.ObjectId(segmentId),
  );
}

export function getSegmentDeltas(
  segmentDeltaRepository: SegmentDeltaRepository,
  segmentId: string,
) {
  return segmentDeltaRepository.findBySegmentId(new Types.ObjectId(segmentId));
}

export function getSinceDateByDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * DAY_IN_MS);
}

export async function segmentMembersInfo(
  customerRepository: CustomerRepository,
  members: SegmentMembershipDocument[],
): Promise<SegmentMembersResponseDto['members']> {
  return Promise.all(
    members.map(async (member) => {
      const customer = await customerRepository.findOne({
        _id: member.customerId,
      });
      return {
        customerId: member.customerId.toString(),
        customerEmail: customer?.email || 'Unknown',
      };
    }),
  );
}
