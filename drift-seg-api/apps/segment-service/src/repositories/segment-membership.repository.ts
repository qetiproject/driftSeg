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
    segmentMembershipModel: Model<SegmentMembershipDocument>,
  ) {
    super(segmentMembershipModel);
  }

  async listCustomerIdsForSegment(segmentId: string): Promise<string[]> {
    const objectId = new Types.ObjectId(segmentId);
    const docs = await this.model
      .find({ segmentId: objectId })
      .select({ customerId: 1, _id: 0 })
      .lean<Array<{ customerId: Types.ObjectId }>>(true);
    return docs.map((doc) => doc.customerId.toString());
  }

  async addMemberships(segmentId: string, customerIds: string[]): Promise<void> {
    if (customerIds.length === 0) {
      return;
    }
    const segmentObjectId = new Types.ObjectId(segmentId);
    const docs = customerIds.map((customerId) => ({
      _id: new Types.ObjectId(),
      segmentId: segmentObjectId,
      customerId: new Types.ObjectId(customerId),
    }));
    await this.model.insertMany(docs, { ordered: false });
  }

  async removeMemberships(
    segmentId: string,
    customerIds: string[],
  ): Promise<void> {
    if (customerIds.length === 0) {
      return;
    }
    await this.model.deleteMany({
      segmentId: new Types.ObjectId(segmentId),
      customerId: { $in: customerIds.map((id) => new Types.ObjectId(id)) },
    });
  }
}
