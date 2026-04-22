import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SegmentDeltaDocument } from '../models';

@Injectable()
export class SegmentDeltaRepository extends AbstractRepository<SegmentDeltaDocument> {
  protected readonly logger = new Logger(SegmentDeltaRepository.name);

  constructor(
    @InjectModel(SegmentDeltaDocument.name)
    segmentDeltaModel: Model<SegmentDeltaDocument>,
  ) {
    super(segmentDeltaModel);
  }
}
