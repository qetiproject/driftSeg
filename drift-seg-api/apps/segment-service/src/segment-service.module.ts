import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { SegmentServiceController } from './controllers/segment-service.controller';
import { IsValidSegmentRuleConstraint } from './dto/rules.validator';
import {
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
import { SegmentQueryService } from './services/segment-query.service';
import { SegmentService } from './services/segment.service';
import { SegmentValidationService } from './services/segment-validation.service';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: SegmentDocument.name, schema: SegmentSchema },
      { name: SegmentMembershipDocument.name, schema: SegmentMembershipSchema },
      { name: SegmentDeltaDocument.name, schema: SegmentDeltaSchema },
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
  controllers: [SegmentServiceController],
  providers: [
    SegmentService,
    SegmentRepository,
    SegmentMembershipRepository,
    SegmentDeltaRepository,
    SegmentValidationService,
    SegmentQueryService,
    IsValidSegmentRuleConstraint,
  ],
})
export class SegmentServiceModule {}
