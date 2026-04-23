import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { SegmentController, SegmentEventsController } from './controllers';
import {
  SegmentDocument,
  SegmentMembershipDocument,
  SegmentMembershipSchema,
  SegmentSchema,
} from './models';
import { SegmentMembershipRepository, SegmentRepository } from './repositories';
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
  ],
})
export class SegmentServiceModule {}
