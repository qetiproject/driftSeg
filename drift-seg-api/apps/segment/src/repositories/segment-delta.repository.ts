import { AbstractRepository } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SegmentDeltaDocument } from '../models/segment-delta.schema';

@Injectable()
export class SegmentDeltaRepository extends AbstractRepository<SegmentDeltaDocument> {
  constructor(
    @InjectModel(SegmentDeltaDocument.name)
    deltaModel: Model<SegmentDeltaDocument>,
  ) {
    super(deltaModel);
  }

  async findBySegmentId(
    segmentId: Types.ObjectId,
  ): Promise<SegmentDeltaDocument[]> {
    return this.model.find({ segmentId }).sort({ computedAt: -1 }).lean();
  }

  async findByTriggerEventIds(
    triggerEventIds: string[],
  ): Promise<SegmentDeltaDocument[]> {
    if (triggerEventIds.length === 0) {
      return [];
    }

    return this.model
      .find({ triggerEventId: { $in: triggerEventIds } })
      .lean<SegmentDeltaDocument[]>(true);
  }

  // deleteDeltasBySegmentId
  async deleteDeltasBySegmentId(segmentId: Types.ObjectId): Promise<void> {
    await this.deleteMany({ segmentId });
  }
}
