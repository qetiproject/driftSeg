import { BadRequestException, Injectable } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '../../constants/error-messages';
import { SEGMENT_RULE } from '../../constants/segment-rule';
import { SegmentRuleKind, SegmentTypeEnum } from '../../dto';
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
    const segmentType = payload.type;
    await segmentNameIsUnique(this.segmentRepository, payload.name);
    return this.segmentDynamic(payload, segmentType);
  }

  private async segmentDynamic(
    payload: CreateSegmentDto,
    segmentType: SegmentTypeEnum,
  ) {
    switch (payload.rules.kind) {
      case SegmentRuleKind.ACTIVE_BUYERS:
        return this.createActiveSegment(payload, segmentType);
      case SegmentRuleKind.VIP:
        return this.createVipSegment(payload, segmentType);
      case SegmentRuleKind.RISK:
        return this.createRiskSegment(payload, segmentType);
      default:
        throw new BadRequestException(
          SEGMENT_ERROR_MESSAGES.ONLY_ACTIVE_AND_VIP_RISK_SUPPORTED,
        );
    }
  }

  private async createActiveSegment(
    payload: CreateSegmentDto,
    segmentType: SegmentTypeEnum,
  ) {
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
      type: segmentType,
      rules: {
        kind: SegmentRuleKind.ACTIVE_BUYERS,
        days: payload.rules.days,
      },
      dependsOnSegmentIds: [],
    });
  }

  private async createVipSegment(
    payload: CreateSegmentDto,
    segmentType: SegmentTypeEnum,
  ) {
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
      type: segmentType,
      rules: {
        kind: SegmentRuleKind.VIP,
        days: payload.rules.days,
        minSpend,
      },
      dependsOnSegmentIds: [],
    });
  }

  private async createRiskSegment(
    payload: CreateSegmentDto,
    segmentType: SegmentTypeEnum,
  ) {
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
      type: segmentType,
      rules: {
        kind: SegmentRuleKind.RISK,
        inActiveDays,
      },
      dependsOnSegmentIds: [],
    });
  }
}
