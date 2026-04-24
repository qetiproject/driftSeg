import { BadRequestException } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '../../constants/error-messages';
import { SEGMENT_RULE } from '../../constants/segment-rule';
import { CreateSegmentDto } from '../../dto/request';
import { noDependenciesSegment } from './create-segment.helpers';

type DynamicCreatePayload = CreateSegmentDto & {
  rules: NonNullable<CreateSegmentDto['rules']>;
};

export function validateActiveRules(payload: DynamicCreatePayload): void {
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

export function validateVipRules(payload: DynamicCreatePayload): number {
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

export function validateRiskRules(payload: DynamicCreatePayload): number {
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
