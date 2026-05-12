import { DatabaseModule } from '@app/common';
import { Customer, CustomerSchema } from '@app/common/models/customer-schema';
import {
  Transaction,
  TransactionSchema,
} from '@app/common/models/transaction-schema';
import {
  CustomerActivityRepository,
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentPendingEventsRepository,
  SegmentRepository,
} from '@segment/repositories';
import {
  SegmentDeltaDocument,
  SegmentDeltaSchema,
} from '@segment/models/segment-delta.schema';
import {
  SegmentMembershipDocument,
  SegmentMembershipSchema,
} from '@segment/models/segment-membership.schema';
import { Segment, SegmentSchema } from '@segment/models/segment.schema';
import { Module } from '@nestjs/common';
import { SegmentInfrastructureModule } from './segment-infrastructure.module';

@Module({
  imports: [
    DatabaseModule,
    SegmentInfrastructureModule,
    DatabaseModule.forFeature([
      { name: Segment.name, schema: SegmentSchema },
      { name: SegmentMembershipDocument.name, schema: SegmentMembershipSchema },
      { name: SegmentDeltaDocument.name, schema: SegmentDeltaSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  providers: [
    SegmentRepository,
    SegmentMembershipRepository,
    SegmentDeltaRepository,
    CustomerActivityRepository,
    SegmentPendingEventsRepository,
  ],
  exports: [
    SegmentRepository,
    SegmentMembershipRepository,
    SegmentDeltaRepository,
    CustomerActivityRepository,
    SegmentPendingEventsRepository,
  ],
})
export class SegmentPersistenceModule {}
