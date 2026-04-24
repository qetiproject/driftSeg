import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SegmentDeltaDocument } from '../models/segment-delta.schema';

@Injectable()
export class SegmentDeltaRepository extends AbstractRepository<SegmentDeltaDocument> {
  protected readonly logger = new Logger(SegmentDeltaRepository.name);

  constructor(
    @InjectModel(SegmentDeltaDocument.name)
    deltaModel: Model<SegmentDeltaDocument>,
  ) {
    super(deltaModel);
  }

  async findBySegmentId(
    segmentId: Types.ObjectId,
  ): Promise<SegmentDeltaDocument[]> {
    return this.model.find({ segmentId }).sort({ computedAt: -1 }).lean(true);
  }

  async deleteBySegmentId(segmentId: Types.ObjectId): Promise<void> {
    await this.model.deleteMany({ segmentId });
  }
}
