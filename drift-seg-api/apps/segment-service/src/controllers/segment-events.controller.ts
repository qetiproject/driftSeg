import type { TransactionCreatedEvent } from '@app/common/dto';
import { TRANSACTION_CREATED_EVENT } from '@app/common/dto';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices/decorators';
import { SegmentMembershipService } from '../services/segment-membership.service';

@Controller()
export class SegmentEventsController {
  constructor(
    private readonly segmentMembershipService: SegmentMembershipService,
  ) {}

  @EventPattern(TRANSACTION_CREATED_EVENT)
  async handleTransactionCreated(
    @Payload() event: TransactionCreatedEvent,
  ): Promise<void> {
    await this.segmentMembershipService.processTransactionCreated(event);
  }
}
