import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SegmentMembershipDocument } from '../models';

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

  deactivateMembership(
    membershipId: Types.ObjectId,
  ): Promise<SegmentMembershipDocument> {
    return this.findOneAndUpdate(
      { _id: membershipId },
      { $set: { isActive: false } },
    );
  }

  async deleteBySegmentId(segmentId: Types.ObjectId): Promise<void> {
    await this.model.deleteMany({ segmentId });
  }
}
