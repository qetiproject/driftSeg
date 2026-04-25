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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import Redis from 'ioredis';
import Joi from 'joi';
import { SEGMENT_NOTIFICATIONS_QUEUE } from './constants/constants';
import {
  SEGMENT_NOTIFICATIONS_CLIENT,
  SEGMENT_REDIS_CLIENT,
} from './constants/tokens';
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
  SegmentDeltaNotifierService,
  SegmentMembershipFacade,
  SegmentMembershipSchedulerService,
  SegmentMembershipService,
  SegmentPendingEventQueueService,
  SegmentRuleEvaluatorService,
  SegmentSearchIndexerService,
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
        REDIS_URL: Joi.string().required(),
        ELASTICSEARCH_NODE: Joi.string().optional(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: SEGMENT_NOTIFICATIONS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
            queue: SEGMENT_NOTIFICATIONS_QUEUE,
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [SegmentController],
  providers: [
    {
      provide: SEGMENT_REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis => {
        const redisUrl = configService.getOrThrow<string>('REDIS_URL');
        return new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
        });
      },
    },
    SegmentService,
    CreateSegmentFacade,
    SegmentMembershipFacade,
    SegmentMembershipService,
    SegmentMembershipSchedulerService,
    SegmentDeltaNotifierService,
    SegmentSearchIndexerService,
    SegmentRuleEvaluatorService,
    SegmentRepository,
    SegmentMembershipRepository,
    SegmentDeltaRepository,
    CustomerActivityRepository,
    CustomerRepository,
    SegmentPendingEventQueueService,
  ],
})
export class SegmentServiceModule {}
