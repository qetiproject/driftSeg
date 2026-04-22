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
