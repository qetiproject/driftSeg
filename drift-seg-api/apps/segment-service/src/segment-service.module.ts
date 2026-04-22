import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { IsValidSegmentRuleConstraint } from './dto/rules.validator';
import {
  CustomerActivityDocument,
  CustomerActivitySchema,
  SegmentDeltaDocument,
  SegmentDeltaSchema,
  SegmentDocument,
  SegmentMembershipDocument,
  SegmentMembershipSchema,
  SegmentSchema,
} from './models';
import { SegmentDeltaRepository } from './repositories/segment-delta.repository';
import { SegmentMembershipRepository } from './repositories/segment-membership.repository';
import { SegmentRepository } from './repositories/segment.repository';
import { CustomerActivityRepository } from './repositories/customer-activity.repository';
import { SegmentOrchestrationService } from './services/segment-orchestration.service';
import { SegmentQueryService } from './services/segment-query.service';
import { SegmentRuntimeService } from './services/segment-runtime.service';
import { SegmentSignalService } from './services/segment-signal.service';
import { SegmentService } from './services/segment.service';
import { SegmentValidationService } from './services/segment-validation.service';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: SegmentDocument.name, schema: SegmentSchema },
      { name: SegmentMembershipDocument.name, schema: SegmentMembershipSchema },
      { name: SegmentDeltaDocument.name, schema: SegmentDeltaSchema },
      { name: CustomerActivityDocument.name, schema: CustomerActivitySchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/segment-service/.env',
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().optional(),
      }),
    }),
  ],
  controllers: [],
  providers: [
    SegmentService,
    SegmentRepository,
    SegmentMembershipRepository,
    SegmentDeltaRepository,
    CustomerActivityRepository,
    SegmentValidationService,
    SegmentQueryService,
    SegmentOrchestrationService,
    SegmentRuntimeService,
    SegmentSignalService,
    IsValidSegmentRuleConstraint,
  ],
  exports: [SegmentService],
})
export class SegmentServiceModule {}
