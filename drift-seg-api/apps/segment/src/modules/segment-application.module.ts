import {
  CreateSegmentFacade,
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
import { SegmentCommandService } from '@segment/services/segment-command.service';
import { Module } from '@nestjs/common';
import { SegmentInfrastructureModule } from './segment-infrastructure.module';
import { SegmentPersistenceModule } from './segment-persistence.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    SegmentPersistenceModule,
    SegmentInfrastructureModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    SegmentService,
    CreateSegmentFacade,
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
    CreateSegmentFacade,
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
