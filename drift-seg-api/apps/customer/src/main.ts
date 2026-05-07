import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { CustomerModule } from './customer.module';

import { setupCors, setupPipes, setupSwagger } from '@customer/setup';

async function bootstrap() {
  const app = await NestFactory.create(CustomerModule);

  setupCors(app);
  setupPipes(app);
  setupSwagger(app);

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') || 3000);
}

bootstrap();
