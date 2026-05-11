import {
  CustomerPersistenceModule,
  SegmentEventsModule,
} from '@customer/modules';
import { CustomerCommandService } from '@customer/services/customer/customer-command.service';
import { CustomerQueryService } from '@customer/services/customer/customer-query.service';
import { TransactionCommandFacade } from '@customer/services/facades/transaction-command.facade';
import { TransactionCommandService } from '@customer/services/transaction/transaction-command.service';
import { TransactionQueryService } from '@customer/services/transaction/transaction-query.service';

import { Module } from '@nestjs/common';

@Module({
  imports: [CustomerPersistenceModule, SegmentEventsModule],
  providers: [
    CustomerCommandService,
    CustomerQueryService,
    TransactionQueryService,
    TransactionCommandFacade,
    TransactionCommandService,
  ],
  exports: [
    CustomerCommandService,
    CustomerQueryService,
    TransactionQueryService,
    TransactionCommandFacade,
    TransactionCommandService,
  ],
})
export class CustomerApplicationModule {}
