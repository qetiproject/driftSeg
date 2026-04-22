import { DatabaseModule } from '@app/common';
import { CustomerDocument, CustomerSchema } from '@app/common/models';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { CustomerServiceController } from './customer-service.controller';
import { CustomerRepository } from './customer.repository';
import { CustomerService } from './customer.service';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: CustomerDocument.name, schema: CustomerSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/customer-service/.env',
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
    }),
  ],
  controllers: [CustomerServiceController],
  providers: [CustomerService, CustomerRepository],
})
export class CustomerServiceModule {}
