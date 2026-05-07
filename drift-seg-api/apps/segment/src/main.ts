import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SegmentModule } from './segment.module';

import { setupHttp } from '@app/common/config/http.setup';
import { setupSwagger } from '@app/common/config/swagger.setup';
import { setupRabbitMQ } from './setup/rabbitmq.setup';

async function bootstrap() {
  const app = await NestFactory.create(SegmentModule);
  const config = app.get(ConfigService);

  setupHttp(app);
  setupSwagger(app);
  setupRabbitMQ(app, config);

  await app.startAllMicroservices();
  await app.listen(config.get('PORT') || 3001, '0.0.0.0');
}

bootstrap();
