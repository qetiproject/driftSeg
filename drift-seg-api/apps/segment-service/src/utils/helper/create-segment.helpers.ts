import { BadRequestException } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '../../constants/error-messages';
import { SEGMENT_RULE } from '../../constants/segment-rule';
import { SegmentTypeEnum } from '../../dto';
import { CreateSegmentDto } from '../../dto/request';
import { SegmentRepository } from '../../repositories';

export function noDependenciesSegment(
  dependsOnSegmentIds?: string[],
  message: string = SEGMENT_ERROR_MESSAGES.ACTIVE_BUYERS_NO_DEPENDENCIES,
): void {
  if ((dependsOnSegmentIds?.length ?? 0) > 0) {
    throw new BadRequestException(message);
  }
}

export async function segmentNameIsUnique(
  segmentRepository: SegmentRepository,
  name: string,
): Promise<void> {
  const alreadyExists = await segmentRepository.existsByName(name);
  if (alreadyExists) {
    throw new BadRequestException(SEGMENT_ERROR_MESSAGES.DUPLICATE_NAME);
  }
}

export function baseSegmentCreatePayload(payload: CreateSegmentDto): {
  name: string;
  type: SegmentTypeEnum;
  dependsOnSegmentIds: [];
} {
  return {
    name: payload.name,
    type: payload.type,
    dependsOnSegmentIds: [],
  };
}

export function validateActiveRules(payload: CreateSegmentDto): void {
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
}

export function validateVipRules(payload: CreateSegmentDto): number {
  if (payload.rules.days !== SEGMENT_RULE.VIP_DAYS) {
    throw new BadRequestException(
      SEGMENT_ERROR_MESSAGES.VIP_REQUIRES_DAYS(SEGMENT_RULE.VIP_DAYS),
    );
  }

  const minSpend = payload.rules.minSpend;
  if (minSpend === undefined || minSpend < SEGMENT_RULE.VIP_MIN_SPEND) {
    throw new BadRequestException(
      SEGMENT_ERROR_MESSAGES.VIP_REQUIRES_MIN_SPEND(SEGMENT_RULE.VIP_MIN_SPEND),
    );
  }

  noDependenciesSegment(
    payload.dependsOnSegmentIds,
    SEGMENT_ERROR_MESSAGES.VIP_SEGMENT_NO_DEPENDENCIES,
  );

  return minSpend;
}

export function validateRiskRules(payload: CreateSegmentDto): number {
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

  return inActiveDays;
}
