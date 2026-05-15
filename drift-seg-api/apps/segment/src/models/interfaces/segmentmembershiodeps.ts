import { Logger } from '@nestjs/common';
import {
  SegmentDeltaRepository,
  SegmentMembershipRepository,
} from '@segment/repositories';
import { SegmentRuleEvaluatorService } from '@segment/services';

export interface SegmentMembershipFacadeDeps {
  logger: Logger;
  segmentRuleEvaluatorService: SegmentRuleEvaluatorService;
  segmentMembershipRepository: SegmentMembershipRepository;
  segmentDeltaRepository: SegmentDeltaRepository;
}
