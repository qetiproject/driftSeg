import { BadRequestException } from '@nestjs/common';
import { SEGMENT_ERROR_MESSAGES } from '@segment/constants/error-messages';
import { SEGMENT_RULE } from '@segment/constants/segment-rule';
import { CreateSegmentDto } from '@segment/dto';

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

  return inActiveDays;
}
