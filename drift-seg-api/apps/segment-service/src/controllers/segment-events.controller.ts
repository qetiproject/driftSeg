import type { TransactionCreatedEvent } from '@app/common/dto';
import { TRANSACTION_CREATED_EVENT } from '@app/common/dto';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SegmentMembershipService } from '../services/segment-membership.service';

@Controller()
export class SegmentEventsController {
  constructor(
    private readonly segmentMembershipService: SegmentMembershipService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @EventPattern(TRANSACTION_CREATED_EVENT)
  async handleTransactionCreated(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    @Payload() event: TransactionCreatedEvent,
  ): Promise<void> {
    await this.segmentMembershipService.processTransactionCreated(event);
  }
}
