import { SEGMENT_NOTIFICATIONS_QUEUE } from '@segment/constants/constants';
import {
  SEGMENT_NOTIFICATIONS_CLIENT,
  SEGMENT_REDIS_CLIENT,
} from '@segment/constants/tokens';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import Redis from 'ioredis';

@Module({
  imports: [
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
  ],
  exports: [ClientsModule, SEGMENT_REDIS_CLIENT],
})
export class SegmentInfrastructureModule {}
