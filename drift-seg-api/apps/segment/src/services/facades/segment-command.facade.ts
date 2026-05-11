import { BadRequestException, Injectable } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '@segment/constants/error-messages';
import {
  CreateSegmentDto,
  CreateSegmentWithRulesDto,
  SegmentRuleInput,
  SegmentRuleKind,
  SegmentTypeEnum,
} from '@segment/dto';
import {
  SegmentDeltaRepository,
  SegmentMembershipRepository,
  SegmentRepository,
} from '@segment/repositories';
import {
  baseSegmentCreatePayload,
  segmentNameIsUnique,
  validateActiveRules,
  validateRiskRules,
  validateVipRules,
} from '@segment/utils';
import { Types } from 'mongoose';

@Injectable()
export class SegmentCommandFacade {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly segmentMembershipRepository: SegmentMembershipRepository,
  ) {}

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

  async deleteSegmentCascade(segmentId: string): Promise<void> {
    await this.deleteSegmentRecursive(segmentId, new Set<string>());
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

  private async deleteSegmentRecursive(
    segmentId: string,
    visited: Set<string>,
  ): Promise<void> {
    if (visited.has(segmentId)) {
      return;
    }
    visited.add(segmentId);

    const segmentObjectId = new Types.ObjectId(segmentId);
    const dependents =
      await this.segmentRepository.findDependentsBySegmentId(segmentObjectId);

    for (const dependent of dependents) {
      await this.deleteSegmentRecursive(dependent._id.toString(), visited);
    }

    await this.segmentMembershipRepository.deleteMembersBySegmentId(
      segmentObjectId,
    );
    await this.segmentDeltaRepository.deleteDeltasBySegmentId(segmentObjectId);
    await this.segmentRepository.deleteSegmentById(segmentId);
  }
}
