import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  SEGMENT_EVENTS_QUEUE,
  SEGMENT_NOTIFICATIONS_QUEUE,
} from '../constants/constants';

export function setupRabbitMQ(app: INestApplication, config: ConfigService) {
  const uri = config.getOrThrow<string>('RABBITMQ_URI');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [uri],
      queue: SEGMENT_EVENTS_QUEUE,
      queueOptions: { durable: true },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [uri],
      queue: SEGMENT_NOTIFICATIONS_QUEUE,
      queueOptions: { durable: true },
    },
  });
}
