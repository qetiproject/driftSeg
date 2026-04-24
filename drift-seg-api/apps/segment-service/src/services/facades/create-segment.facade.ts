import { BadRequestException, Injectable } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '../../constants/error-messages';
import { SegmentRuleKind } from '../../dto';
import { CreateSegmentDto } from '../../dto/request';
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
    return this.createDynamicSegment(payload);
  }

  private async createDynamicSegment(payload: CreateSegmentDto) {
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
    validateActiveRules(payload);

    return this.segmentRepository.create({
      ...baseSegmentCreatePayload(payload),
      rules: {
        kind: SegmentRuleKind.ACTIVE_BUYERS,
        days: payload.rules.days,
      },
    });
  }

  private async createVipSegment(payload: CreateSegmentDto) {
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

  private async createRiskSegment(payload: CreateSegmentDto) {
    const inActiveDays = validateRiskRules(payload);

    return this.segmentRepository.create({
      ...baseSegmentCreatePayload(payload),
      rules: {
        kind: SegmentRuleKind.RISK,
        inActiveDays,
      },
    });
  }
}
