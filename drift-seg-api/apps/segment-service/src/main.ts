import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  SEGMENT_EVENTS_QUEUE,
  SEGMENT_NOTIFICATIONS_QUEUE,
} from './constants/constants';
import { SegmentServiceModule } from './segment.module';

async function bootstrap() {
  const app = await NestFactory.create(SegmentServiceModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
      queue: SEGMENT_EVENTS_QUEUE,
      queueOptions: {
        durable: true,
      },
    },
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
      queue: SEGMENT_NOTIFICATIONS_QUEUE,
      queueOptions: {
        durable: true,
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT') || 3001, '0.0.0.0');
}
bootstrap();
