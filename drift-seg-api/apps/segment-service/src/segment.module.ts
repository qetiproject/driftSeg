import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { SegmentController, SegmentEventsController } from './controllers';
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
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from './repositories';
import {
  CreateSegmentFacade,
  SegmentMembershipService,
  SegmentService,
} from './services';

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
        RABBITMQ_URI: Joi.string().required(),
      }),
    }),
  ],
  controllers: [SegmentController, SegmentEventsController],
  providers: [
    SegmentService,
    CreateSegmentFacade,
    SegmentMembershipService,
    SegmentRepository,
    SegmentMembershipRepository,
    SegmentDeltaRepository,
  ],
})
export class SegmentServiceModule {}
