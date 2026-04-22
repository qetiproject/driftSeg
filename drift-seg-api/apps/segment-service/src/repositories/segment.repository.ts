import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SegmentDocument } from '../models';

@Injectable()
export class SegmentRepository extends AbstractRepository<SegmentDocument> {
  protected readonly logger = new Logger(SegmentRepository.name);

  constructor(
    @InjectModel(SegmentDocument.name)
    segmentModel: Model<SegmentDocument>,
  ) {
    super(segmentModel);
  }

  async countByIds(ids: string[]): Promise<number> {
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    return await this.model.countDocuments({ _id: { $in: objectIds } });
  }

  async findByName(name: string): Promise<SegmentDocument | null> {
    return await this.model.findOne({ name }).lean<SegmentDocument>(true);
  }

  async hasDependents(segmentId: string): Promise<boolean> {
    const count = await this.model.countDocuments({
      dependsOnSegmentIds: new Types.ObjectId(segmentId),
    });
    return count > 0;
  }
}
