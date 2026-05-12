import { TransactionCreatedEvent } from '@app/common/dto';
import { Injectable } from '@nestjs/common';
import { TRANSACTION_CREATED_EVENT } from '@segment/constants/constants';
import { SegmentPendingEventQueueService } from '@segment/services/segment-penging-event.service';

@Injectable()
export class TransactionEventService {
  constructor(
    private readonly segmentPendingEventQueueService: SegmentPendingEventQueueService,
  ) {}

  async transactionCreated(event: TransactionCreatedEvent): Promise<void> {
    if (event.eventType !== TRANSACTION_CREATED_EVENT) {
      return;
    }

    await this.segmentPendingEventQueueService.addPendingEvent(
      event.data.customerId,
      {
        eventId: event.eventId,
        eventType: event.eventType,
      },
    );
  }
}
