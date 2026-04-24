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
    if (!payload.rules) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.ONLY_ACTIVE_AND_VIP_RISK_SUPPORTED,
      );
    }
    const payloadWithRules = payload as PayloadWithRules;

    if (payload.type === SegmentTypeEnum.STATIC) {
      return this.createStaticSegment(payloadWithRules);
    }
    return this.createDynamicSegment(payloadWithRules);
  }

  private async createDynamicSegment(payload: PayloadWithRules) {
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

  private async createActiveSegment(payload: PayloadWithRules) {
    validateActiveRules(payload);

    return this.segmentRepository.create({
      ...baseSegmentCreatePayload(payload),
      rules: {
        kind: SegmentRuleKind.ACTIVE_BUYERS,
        days: payload.rules.days,
      },
    });
  }

  private async createVipSegment(payload: PayloadWithRules) {
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

  private async createRiskSegment(payload: PayloadWithRules) {
    const inActiveDays = validateRiskRules(payload);

    return this.segmentRepository.create({
      ...baseSegmentCreatePayload(payload),
      rules: {
        kind: SegmentRuleKind.RISK,
        inActiveDays,
      },
    });
  }

  private async createStaticSegment(payload: PayloadWithRules) {
    switch (payload.rules.kind) {
      case SegmentRuleKind.ACTIVE_BUYERS:
        validateActiveRules(payload);
        return this.segmentRepository.create({
          ...baseSegmentCreatePayload(payload),
          staticSegmentKind: payload.staticSegmentKind ?? payload.rules.kind,
          rules: {
            kind: SegmentRuleKind.ACTIVE_BUYERS,
            days: payload.rules.days,
          },
        });
      case SegmentRuleKind.VIP:
        return this.segmentRepository.create({
          ...baseSegmentCreatePayload(payload),
          staticSegmentKind: payload.staticSegmentKind ?? payload.rules.kind,
          rules: {
            kind: SegmentRuleKind.VIP,
            days: payload.rules.days,
            minSpend: validateVipRules(payload),
          },
        });
      case SegmentRuleKind.RISK:
        return this.segmentRepository.create({
          ...baseSegmentCreatePayload(payload),
          staticSegmentKind: payload.staticSegmentKind ?? payload.rules.kind,
          rules: {
            kind: SegmentRuleKind.RISK,
            inActiveDays: validateRiskRules(payload),
          },
        });
      default:
        throw new BadRequestException(
          SEGMENT_ERROR_MESSAGES.ONLY_ACTIVE_AND_VIP_RISK_SUPPORTED,
        );
    }
  }
}

type PayloadWithRules = CreateSegmentDto & {
  rules: SegmentRulesDto;
};
