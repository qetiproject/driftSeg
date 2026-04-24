import { DatabaseModule } from '@app/common';
import {
  CustomerDocument,
  CustomerSchema,
} from '@app/common/models/customer-schema';
import {
  TransactionDocument,
  TransactionSchema,
} from '@app/common/models/transaction-schema';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import Joi from 'joi';
import { SegmentController } from './controllers';
import {
  SegmentDeltaDocument,
  SegmentDeltaSchema,
} from './models/segment-delta.schema';
import {
  SegmentMembershipDocument,
  SegmentMembershipSchema,
} from './models/segment-membership.schema';
import { SegmentDocument, SegmentSchema } from './models/segment.schema';
import {
  CustomerActivityRepository,
  CustomerRepository,
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from './repositories';
import {
  CreateSegmentFacade,
  SegmentMembershipFacade,
  SegmentMembershipSchedulerService,
  SegmentMembershipService,
  SegmentRuleEvaluatorService,
  SegmentService,
} from './services';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
    DatabaseModule.forFeature([
      { name: SegmentDocument.name, schema: SegmentSchema },
      { name: SegmentMembershipDocument.name, schema: SegmentMembershipSchema },
      { name: SegmentDeltaDocument.name, schema: SegmentDeltaSchema },
      { name: TransactionDocument.name, schema: TransactionSchema },
      { name: CustomerDocument.name, schema: CustomerSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/segment-service/.env',
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().optional(),
        RABBITMQ_URI: Joi.string().required(),
      }),
    }),
  ],
  controllers: [SegmentController],
  providers: [
    SegmentService,
    CreateSegmentFacade,
    SegmentMembershipFacade,
    SegmentMembershipService,
    SegmentMembershipSchedulerService,
    SegmentRuleEvaluatorService,
    SegmentRepository,
    SegmentMembershipRepository,
    SegmentDeltaRepository,
    CustomerActivityRepository,
    CustomerRepository,
  ],
})
export class SegmentServiceModule {}
