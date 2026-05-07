import { setupHttp } from '@app/common/config/http.setup';
import { setupSwagger } from '@app/common/config/swagger.setup';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { CustomerModule } from './customer.module';

async function bootstrap() {
  const app = await NestFactory.create(CustomerModule);

  setupHttp(app);
  setupSwagger(app);

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') || 3000);
}

bootstrap();
