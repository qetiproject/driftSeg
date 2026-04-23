import { DatabaseModule } from '@app/common';
import {
  CustomerDocument,
  CustomerSchema,
  TransactionDocument,
  TransactionSchema,
} from '@app/common/models';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { CustomerController } from './controllers/customer.controller';
import { TransactionController } from './controllers/transaction.controller';
import { TransactionRepository } from './repositories';
import { CustomerRepository } from './repositories/customer.repository';
import { CustomerService } from './services/customer.service';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: CustomerDocument.name, schema: CustomerSchema },
      { name: TransactionDocument.name, schema: TransactionSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/customer-service/.env',
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
    }),
  ],
  controllers: [CustomerController, TransactionController],
  providers: [
    CustomerService,
    CustomerRepository,
    TransactionService,
    TransactionRepository,
  ],
})
export class CustomerServiceModule {}
