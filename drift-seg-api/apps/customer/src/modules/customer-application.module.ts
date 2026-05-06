import {
  CustomerPersistenceModule,
  SegmentEventsModule,
} from '@customer/modules';
import {
  CustomerCommandService,
  CustomerQueryService,
  TransactionService,
} from '@customer/services';
import { Module } from '@nestjs/common';

@Module({
  imports: [CustomerPersistenceModule, SegmentEventsModule],
  providers: [CustomerCommandService, CustomerQueryService, TransactionService],
  exports: [CustomerCommandService, CustomerQueryService, TransactionService],
})
export class CustomerApplicationModule {}
