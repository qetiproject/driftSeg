import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SEGMENT_EVENTS_QUEUE } from '../constants/constants';
import { SEGMENT_EVENTS_CLIENT } from '../constants/tokens';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SEGMENT_EVENTS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
            queue: SEGMENT_EVENTS_QUEUE,
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class SegmentEventsModule {}
