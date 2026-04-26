import { CreateSegmentForm, SegmentTypeEnum, SegmentkindEnum } from '../types';
import { SEGMENT_RULE_DEFAULTS } from './create-segment-modal';

function hasInvalidDependsOnIds(dependsOnSegmentIdsRaw: string): boolean {
  if (dependsOnSegmentIdsRaw.trim().length === 0) {
    return false;
  }

  const ids = dependsOnSegmentIdsRaw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const mongoIdRegex = /^[a-fA-F0-9]{24}$/;

  return ids.some((id) => !mongoIdRegex.test(id));
}

function validateDynamicRules(value: CreateSegmentForm): string[] {
  if (
    value.ruleKind === SegmentkindEnum.ACTIVE_BUYERS &&
    Number(value.days) !== SEGMENT_RULE_DEFAULTS.activeDays
  ) {
    return [`Active buyers rule requires days = ${SEGMENT_RULE_DEFAULTS.activeDays}.`];
  }

  if (value.ruleKind === SegmentkindEnum.VIP) {
    const errors: string[] = [];
    if (Number(value.days) !== SEGMENT_RULE_DEFAULTS.vipDays) {
      errors.push(`VIP rule requires days = ${SEGMENT_RULE_DEFAULTS.vipDays}.`);
    }
    if (Number(value.minSpend) < SEGMENT_RULE_DEFAULTS.vipMinSpend) {
      errors.push(`VIP rule requires minSpend >= ${SEGMENT_RULE_DEFAULTS.vipMinSpend}.`);
    }
    return errors;
  }

  if (
    value.ruleKind === SegmentkindEnum.RISK &&
    Number(value.inActiveDays) !== SEGMENT_RULE_DEFAULTS.riskInactiveDays
  ) {
    return [`Risk rule requires inActiveDays = ${SEGMENT_RULE_DEFAULTS.riskInactiveDays}.`];
  }

  return [];
}

export function validateCreateSegmentForm(value: CreateSegmentForm): string[] {
  const errors: string[] = [];

  if (value.name.trim().length < 2) {
    errors.push('Segment name must be at least 2 characters.');
  }

  if (hasInvalidDependsOnIds(value.dependsOnSegmentIds)) {
    errors.push('Depends On IDs must be valid Mongo IDs (24 hex chars), comma separated.');
  }

  if (value.type === SegmentTypeEnum.Static) {
    if (!value.staticSegmentKind?.trim()) {
      errors.push('Static segment kind is required for static segments.');
    }
    return errors;
  }

  return [...errors, ...validateDynamicRules(value)];
}
