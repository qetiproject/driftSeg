import {
  CustomerController,
  TransactionController,
} from '@customer/controllers';
import { CustomerApplicationModule } from '@customer/modules/customer-application.module';
import { CustomerConfigModule } from '@customer/modules/customer-config.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [CustomerConfigModule, CustomerApplicationModule],
  controllers: [CustomerController, TransactionController],
})
export class CustomerModule {}
