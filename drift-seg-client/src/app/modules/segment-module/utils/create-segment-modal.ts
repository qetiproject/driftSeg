import { signal } from '@angular/core';
import { CreateSegmentRequest, CreateSegmentForm, SegmentTypeEnum, SegmentkindEnum } from '../types';

export const SEGMENT_RULE_DEFAULTS = {
  activeDays: 30,
  vipDays: 60,
  vipMinSpend: 5000,
  riskInactiveDays: 90,
} as const;

export const createSegmentModel = () =>
  signal<CreateSegmentForm>({
    name: '',
    type: SegmentTypeEnum.Dynamic,
    ruleKind: SegmentkindEnum.ACTIVE_BUYERS,
    days: String(SEGMENT_RULE_DEFAULTS.activeDays),
    minSpend: String(SEGMENT_RULE_DEFAULTS.vipMinSpend),
    inActiveDays: String(SEGMENT_RULE_DEFAULTS.riskInactiveDays),
    dependsOnSegmentIds: '',
    staticSegmentKind: '',
  });

export function toCreateSegmentRequest(value: CreateSegmentForm): CreateSegmentRequest {
  const dependsOnSegmentIds = value.dependsOnSegmentIds
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (value.type === SegmentTypeEnum.Static) {
    return {
      name: value.name.trim(),
      type: value.type,
      staticSegmentKind: value.staticSegmentKind?.trim() || 'manual_refresh',
      rules: {
        kind: value.ruleKind,
      },
      ...(dependsOnSegmentIds.length > 0 ? { dependsOnSegmentIds } : {}),
    };
  }

  if (value.ruleKind === SegmentkindEnum.ACTIVE_BUYERS) {
    return {
      name: value.name.trim(),
      type: value.type,
      rules: {
        kind: value.ruleKind,
        days: Number(value.days),
      },
      ...(dependsOnSegmentIds.length > 0 ? { dependsOnSegmentIds } : {}),
    };
  }

  if (value.ruleKind === SegmentkindEnum.VIP) {
    return {
      name: value.name.trim(),
      type: value.type,
      rules: {
        kind: value.ruleKind,
        days: Number(value.days),
        minSpend: Number(value.minSpend),
      },
      ...(dependsOnSegmentIds.length > 0 ? { dependsOnSegmentIds } : {}),
    };
  }

  return {
    name: value.name.trim(),
    type: value.type,
    rules: {
      kind: value.ruleKind,
      inActiveDays: Number(value.inActiveDays),
    },
    ...(dependsOnSegmentIds.length > 0 ? { dependsOnSegmentIds } : {}),
  };
}
