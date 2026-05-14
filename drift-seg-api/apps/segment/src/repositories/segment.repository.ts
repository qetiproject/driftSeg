import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SegmentTypeEnum } from '@segment/dto/segment-rule';
import { Model, Types } from 'mongoose';
import { Segment, SegmentDocument } from '../models';

@Injectable()
export class SegmentRepository extends AbstractRepository<Segment> {
  protected readonly logger = new Logger(SegmentRepository.name);

  constructor(
    @InjectModel(Segment.name)
    segmentModel: Model<Segment>,
  ) {
    super(segmentModel);
  }

  async existsByName(name: string): Promise<boolean> {
    const normalizedName = name.trim();
    const existing = await this.model.exists({ name: normalizedName });
    return existing !== null;
  }

  async findDependentsBySegmentId(
    segmentId: Types.ObjectId,
  ): Promise<Segment[]> {
    return this.model
      .find({ dependsOnSegmentIds: segmentId })
      .lean<Segment[]>();
  }

  async deleteSegmentById(segmentId: string): Promise<void> {
    await this.findByIdAndDelete(segmentId);
  }

  async getSegments(
    skip: number,
    limit: number,
    filter: Record<string, unknown>,
  ): Promise<SegmentDocument[]> {
    return this.model.find(filter).skip(skip).limit(limit).lean();
  }

  async getDynamicSegments(): Promise<SegmentDocument[]> {
    return this.model
      .find({
        type: SegmentTypeEnum.DYNAMIC,
      })
      .lean();
  }
}
