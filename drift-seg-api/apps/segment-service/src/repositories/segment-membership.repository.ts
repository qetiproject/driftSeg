import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
}
