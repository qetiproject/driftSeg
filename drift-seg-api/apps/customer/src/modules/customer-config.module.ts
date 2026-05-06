import { CUSTOMER_SERVICE_ENV_FILE_PATH } from '@customer/constants/constants';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: CUSTOMER_SERVICE_ENV_FILE_PATH,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        RABBITMQ_URI: Joi.string().required(),
      }),
    }),
  ],
})
export class CustomerConfigModule {}
