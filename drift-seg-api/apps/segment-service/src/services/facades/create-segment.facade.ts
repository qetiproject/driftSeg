import { BadRequestException, Injectable } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '../../constants/error-messages';
import { SEGMENT_RULE } from '../../constants/segment-rule';
import { SegmentRuleKind } from '../../dto';
import { CreateSegmentDto } from '../../dto/request';
import { SegmentRepository } from '../../repositories';
import {
  noDependenciesSegment,
  segmentNameIsUnique,
} from '../../utils/helper/create-segment.helpers';

@Injectable()
export class CreateSegmentFacade {
  constructor(private readonly segmentRepository: SegmentRepository) {}

  async createSegment(payload: CreateSegmentDto) {
    await segmentNameIsUnique(this.segmentRepository, payload.name);
    return this.segmentDynamic(payload);
  }

  private async segmentDynamic(payload: CreateSegmentDto) {
    switch (payload.rules.kind) {
      case SegmentRuleKind.ACTIVE_BUYERS:
        return this.createActiveSegment(payload);
      case SegmentRuleKind.VIP:
        return this.createVipSegment(payload);
      case SegmentRuleKind.RISK:
        return this.createRiskSegment(payload);
      default:
        throw new BadRequestException(
          SEGMENT_ERROR_MESSAGES.ONLY_ACTIVE_AND_VIP_RISK_SUPPORTED,
        );
    }
  }

  private async createActiveSegment(payload: CreateSegmentDto) {
    if (payload.rules.days !== SEGMENT_RULE.ACTIVE_DAYS) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.ACTIVE_BUYERS_REQUIRES_DAYS(
          SEGMENT_RULE.ACTIVE_DAYS,
        ),
      );
    }

    noDependenciesSegment(
      payload.dependsOnSegmentIds,
      SEGMENT_ERROR_MESSAGES.ACTIVE_BUYERS_NO_DEPENDENCIES,
    );

    return this.segmentRepository.create({
      name: payload.name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: payload.type,
      rules: {
        kind: SegmentRuleKind.ACTIVE_BUYERS,
        days: payload.rules.days,
      },
      dependsOnSegmentIds: [],
    });
  }

  private async createVipSegment(payload: CreateSegmentDto) {
    if (payload.rules.days !== SEGMENT_RULE.VIP_DAYS) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.VIP_REQUIRES_DAYS(SEGMENT_RULE.VIP_DAYS),
      );
    }

    const minSpend = payload.rules.minSpend;
    if (minSpend === undefined || minSpend < SEGMENT_RULE.VIP_MIN_SPEND) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.VIP_REQUIRES_MIN_SPEND(
          SEGMENT_RULE.VIP_MIN_SPEND,
        ),
      );
    }

    noDependenciesSegment(
      payload.dependsOnSegmentIds,
      SEGMENT_ERROR_MESSAGES.VIP_SEGMENT_NO_DEPENDENCIES,
    );

    return this.segmentRepository.create({
      name: payload.name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: payload.type,
      rules: {
        kind: SegmentRuleKind.VIP,
        days: payload.rules.days,
        minSpend,
      },
      dependsOnSegmentIds: [],
    });
  }

  private async createRiskSegment(payload: CreateSegmentDto) {
    const inActiveDays = payload.rules.inActiveDays;
    if (inActiveDays !== SEGMENT_RULE.RISK_INACTIVE_DAYS) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.RISK_REQUIRES_INACTIVE_DAYS(
          SEGMENT_RULE.RISK_INACTIVE_DAYS,
        ),
      );
    }

    noDependenciesSegment(
      payload.dependsOnSegmentIds,
      SEGMENT_ERROR_MESSAGES.RISK_SEGMENT_NO_DEPENDENCIES,
    );

    return this.segmentRepository.create({
      name: payload.name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: payload.type,
      rules: {
        kind: SegmentRuleKind.RISK,
        inActiveDays,
      },
      dependsOnSegmentIds: [],
    });
  }
}
