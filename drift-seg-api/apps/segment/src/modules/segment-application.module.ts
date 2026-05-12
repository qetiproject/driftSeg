import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {
    SegmentCommandFacade,
    SegmentDeltaNotifierService,
    SegmentMembershipFacade,
    SegmentMembershipSchedulerService,
    SegmentMembershipService,
    SegmentPendingEventQueueService,
    SegmentQueryService,
    SegmentRuleEvaluatorService,
    SegmentSearchIndexerService,
    SegmentService,
    SegmentWithMembersFacade,
} from '@segment/services';
import { SegmentCommandService } from '@segment/services/segment methods/segment-command.service';
import { SegmentInfrastructureModule } from './segment-infrastructure.module';
import { SegmentPersistenceModule } from './segment-persistence.module';

@Module({
  imports: [
    SegmentPersistenceModule,
    SegmentInfrastructureModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    SegmentService,
    SegmentCommandFacade,
    SegmentMembershipFacade,
    SegmentWithMembersFacade,
    SegmentMembershipService,
    SegmentMembershipSchedulerService,
    SegmentDeltaNotifierService,
    SegmentSearchIndexerService,
    SegmentRuleEvaluatorService,
    SegmentQueryService,
    SegmentPendingEventQueueService,
    SegmentCommandService,
  ],
  exports: [
    SegmentService,
    SegmentCommandFacade,
    SegmentMembershipFacade,
    SegmentWithMembersFacade,
    SegmentMembershipService,
    SegmentMembershipSchedulerService,
    SegmentDeltaNotifierService,
    SegmentSearchIndexerService,
    SegmentRuleEvaluatorService,
    SegmentQueryService,
    SegmentPendingEventQueueService,
    SegmentCommandService,
  ],
})
export class SegmentApplicationModule {}
