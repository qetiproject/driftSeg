import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CustomerServiceModule } from './customer-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CustomerServiceModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
