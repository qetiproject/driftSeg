import { BadRequestException, Injectable } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '../../constants/error-messages';
import { SegmentRuleKind, SegmentTypeEnum } from '../../dto';
import { CreateSegmentDto } from '../../dto/request';
import { SegmentRulesDto } from '../../dto/request/create-segment.dto';
import { SegmentRepository } from '../../repositories';
import {
  validateActiveRules,
  validateRiskRules,
  validateVipRules,
} from '../../utils/helper/create-segment-validate.helper';
import {
  baseSegmentCreatePayload,
  segmentNameIsUnique,
} from '../../utils/helper/create-segment.helpers';

@Injectable()
export class CreateSegmentFacade {
  constructor(private readonly segmentRepository: SegmentRepository) {}

  async createSegment(payload: CreateSegmentDto) {
    await segmentNameIsUnique(this.segmentRepository, payload.name);
    if (payload.type === SegmentTypeEnum.STATIC) {
      return this.createStaticSegment(payload);
    }
    return this.createDynamicSegment(payload);
  }

  private async createDynamicSegment(payload: CreateSegmentDto) {
    if (!payload.rules) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.ONLY_ACTIVE_AND_VIP_RISK_SUPPORTED,
      );
    }
    const dynamicPayload = payload as DynamicCreateSegmentPayload;

    switch (dynamicPayload.rules.kind) {
      case SegmentRuleKind.ACTIVE_BUYERS:
        return this.createActiveSegment(dynamicPayload);
      case SegmentRuleKind.VIP:
        return this.createVipSegment(dynamicPayload);
      case SegmentRuleKind.RISK:
        return this.createRiskSegment(dynamicPayload);
      default:
        throw new BadRequestException(
          SEGMENT_ERROR_MESSAGES.ONLY_ACTIVE_AND_VIP_RISK_SUPPORTED,
        );
    }
  }

  private async createActiveSegment(payload: DynamicCreateSegmentPayload) {
    validateActiveRules(payload);

    return this.segmentRepository.create({
      ...baseSegmentCreatePayload(payload),
      rules: {
        kind: SegmentRuleKind.ACTIVE_BUYERS,
        days: payload.rules.days,
      },
    });
  }

  private async createVipSegment(payload: DynamicCreateSegmentPayload) {
    const minSpend = validateVipRules(payload);

    return this.segmentRepository.create({
      ...baseSegmentCreatePayload(payload),
      rules: {
        kind: SegmentRuleKind.VIP,
        days: payload.rules.days,
        minSpend,
      },
    });
  }

  private async createRiskSegment(payload: DynamicCreateSegmentPayload) {
    const inActiveDays = validateRiskRules(payload);

    return this.segmentRepository.create({
      ...baseSegmentCreatePayload(payload),
      rules: {
        kind: SegmentRuleKind.RISK,
        inActiveDays,
      },
    });
  }

  private async createStaticSegment(payload: CreateSegmentDto) {
    return this.segmentRepository.create({
      ...baseSegmentCreatePayload(payload),
      staticSegmentKind: payload.staticSegmentKind,
    });
  }
}

type DynamicCreateSegmentPayload = CreateSegmentDto & {
  rules: SegmentRulesDto;
};
