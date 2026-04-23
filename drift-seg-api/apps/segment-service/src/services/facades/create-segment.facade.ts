import { BadRequestException, Injectable } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '../constants/error-messages';
import { SegmentRuleKind } from '../dto';
import { CreateSegmentDto } from '../dto/request';
import { SegmentRepository } from '../repositories';
import {
  ensureNoDependenciesSegment,
  ensureSegmentNameIsUnique,
} from '../utils/helper/create-segment.helpers';

@Injectable()
export class CreateSegmentFacade {
  private readonly activeDays = 30;
  private readonly vipDays = 60;
  private readonly inActiveDays = 90;
  private readonly minSpend = 5000;

  constructor(private readonly segmentRepository: SegmentRepository) {}

  async createSegment(payload: CreateSegmentDto) {
    await ensureSegmentNameIsUnique(this.segmentRepository, payload.name);
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
    if (payload.rules.days !== this.activeDays) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.ACTIVE_BUYERS_REQUIRES_DAYS(this.activeDays),
      );
    }

    ensureNoDependenciesSegment(
      payload.dependsOnSegmentIds,
      SEGMENT_ERROR_MESSAGES.ACTIVE_BUYERS_NO_DEPENDENCIES,
    );

    return this.segmentRepository.create({
      name: payload.name,
      type: payload.type,
      rules: {
        kind: SegmentRuleKind.ACTIVE_BUYERS,
        days: payload.rules.days,
      },
      dependsOnSegmentIds: [],
    });
  }

  private async createVipSegment(payload: CreateSegmentDto) {
    if (payload.rules.days !== this.vipDays) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.VIP_REQUIRES_DAYS(this.vipDays),
      );
    }

    const minSpend = payload.rules.minSpend;
    if (minSpend === undefined || minSpend < this.minSpend) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.VIP_REQUIRES_MIN_SPEND(this.minSpend),
      );
    }

    ensureNoDependenciesSegment(
      payload.dependsOnSegmentIds,
      SEGMENT_ERROR_MESSAGES.VIP_SEGMENT_NO_DEPENDENCIES,
    );

    return this.segmentRepository.create({
      name: payload.name,
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
    if (inActiveDays !== this.inActiveDays) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.RISK_REQUIRES_INACTIVE_DAYS(this.inActiveDays),
      );
    }

    ensureNoDependenciesSegment(
      payload.dependsOnSegmentIds,
      SEGMENT_ERROR_MESSAGES.RISK_SEGMENT_NO_DEPENDENCIES,
    );

    return this.segmentRepository.create({
      name: payload.name,
      type: payload.type,
      rules: {
        kind: SegmentRuleKind.RISK,
        inActiveDays,
      },
      dependsOnSegmentIds: [],
    });
  }
}
