import { DatabaseModule } from '@app/common';
import {
  Customer,
  CustomerSchema,
  TransactionDocument,
  TransactionSchema,
} from '@app/common/models';
import { CustomerRepository } from '@customer/repositories/customer.repository';
import { TransactionRepository } from '@customer/repositories/transaction.repository';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: TransactionDocument.name, schema: TransactionSchema },
    ]),
  ],
  providers: [CustomerRepository, TransactionRepository],
  exports: [CustomerRepository, TransactionRepository],
})
export class CustomerPersistenceModule {}
