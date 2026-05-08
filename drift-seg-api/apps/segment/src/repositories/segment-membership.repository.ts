import { AbstractRepository } from '@app/common';
import { Customer } from '@app/common/models/customer-schema';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SegmentMembershipDocument } from '../models';

type SegmentMemberWithCustomer = SegmentMembershipDocument & {
  customerId:
    | Types.ObjectId
    | {
        _id: Types.ObjectId;
        email?: string;
      };
};

@Injectable()
export class SegmentMembershipRepository extends AbstractRepository<SegmentMembershipDocument> {
  protected readonly logger = new Logger(SegmentMembershipRepository.name);

  constructor(
    @InjectModel(SegmentMembershipDocument.name)
    membershipModel: Model<SegmentMembershipDocument>,
  ) {
    super(membershipModel);
  }

  async findActiveMembership(
    segmentId: Types.ObjectId,
    customerId: Types.ObjectId,
  ): Promise<SegmentMembershipDocument | null> {
    return this.model
      .findOne({ segmentId, customerId, isActive: true })
      .lean(true);
  }

  async findActiveMembersBySegmentId(
    segmentId: Types.ObjectId,
  ): Promise<SegmentMembershipDocument[]> {
    return this.model.find({ segmentId, isActive: true }).lean(true);
  }

  async findActiveMembersWithCustomerBySegmentId(
    segmentId: Types.ObjectId,
    options?: { fullCustomerData?: boolean },
  ): Promise<SegmentMemberWithCustomer[]> {
    const { fullCustomerData = false } = options ?? {};

    return this.model
      .find({ segmentId, isActive: true })
      .populate({
        path: 'customerId',
        model: Customer.name,
        select: fullCustomerData ? undefined : '_id email',
      })
      .lean(true);
  }

  deactivateMembership(
    membershipId: Types.ObjectId,
  ): Promise<SegmentMembershipDocument> {
    return this.findOneAndUpdate(
      { _id: membershipId },
      { $set: { isActive: false } },
    ).then((membership) => {
      if (!membership) {
        throw new NotFoundException('Segment membership not found');
      }

      return membership;
    });
  }

  async deleteBySegmentId(segmentId: Types.ObjectId): Promise<void> {
    await this.model.deleteMany({ segmentId });
  }
}
