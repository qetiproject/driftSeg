import { SEGMENT_ENV_FILE_PATH } from '@segment/constants/constants';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: SEGMENT_ENV_FILE_PATH,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().optional(),
        RABBITMQ_URI: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        ELASTICSEARCH_NODE: Joi.string().optional(),
      }),
    }),
  ],
})
export class SegmentConfigModule {}
