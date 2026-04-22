import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SegmentServiceModule } from './segment-service.module';

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
  await app.listen(configService.get('PORT') || 3001, '0.0.0.0');
}
bootstrap();
