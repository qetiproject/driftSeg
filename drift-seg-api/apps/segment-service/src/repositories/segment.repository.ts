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

  async existsByName(name: string): Promise<boolean> {
    const normalizedName = name.trim();
    const existing = await this.model.exists({ name: normalizedName });
    return existing !== null;
  }

  findDependentsBySegmentId(segmentId: Types.ObjectId): Promise<SegmentDocument[]> {
    return this.model
      .find({ dependsOnSegmentIds: segmentId })
      .lean<SegmentDocument[]>(true);
  }
}
