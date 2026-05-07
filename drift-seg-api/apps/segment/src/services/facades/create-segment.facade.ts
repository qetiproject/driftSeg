import { BadRequestException, Injectable } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '../../constants/error-messages';
import { SegmentRuleInput, SegmentRuleKind, SegmentTypeEnum } from '../../dto';
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

    const payloadWithRules = payload as CreateSegmentWithRulesDto;

    return payload.type === SegmentTypeEnum.STATIC
      ? this.createStaticSegment(payloadWithRules)
      : this.createDynamicSegment(payloadWithRules);
  }

  private async createDynamicSegment(payload: CreateSegmentWithRulesDto) {
    return this.segmentRepository.create({
      ...baseSegmentCreatePayload(payload),
      rules: this.buildRules(payload),
    });
  }

  private async createStaticSegment(payload: CreateSegmentWithRulesDto) {
    return this.segmentRepository.create({
      ...baseSegmentCreatePayload(payload),
      staticSegmentKind: payload.staticSegmentKind ?? payload.rules.kind,
      rules: this.buildRules(payload),
    });
  }

  private buildRules(payload: CreateSegmentWithRulesDto): SegmentRuleInput {
    switch (payload.rules.kind) {
      case SegmentRuleKind.ACTIVE_BUYERS:
        validateActiveRules(payload);

        return {
          kind: SegmentRuleKind.ACTIVE_BUYERS,
          days: payload.rules.days,
        };

      case SegmentRuleKind.VIP:
        return {
          kind: SegmentRuleKind.VIP,
          days: payload.rules.days,
          minSpend: validateVipRules(payload),
        };

      case SegmentRuleKind.RISK:
        return {
          kind: SegmentRuleKind.RISK,
          inActiveDays: validateRiskRules(payload),
        };

      default:
        throw new BadRequestException(
          SEGMENT_ERROR_MESSAGES.ONLY_ACTIVE_AND_VIP_RISK_SUPPORTED,
        );
    }
  }
}

type CreateSegmentWithRulesDto = CreateSegmentDto & {
  rules: SegmentRulesDto;
};
