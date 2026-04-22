import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import {
    SegmentCompositionOperator,
    SegmentRuleKind,
} from './enums/rule-kinds';

@ValidatorConstraint({ name: 'isValidSegmentRule', async: false })
export class IsValidSegmentRuleConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const rule = value as Record<string, unknown>;
    const kind = rule.kind as SegmentRuleKind | undefined;
    if (!kind) {
      return false;
    }

    if (kind === SegmentRuleKind.ACTIVE_BUYERS) {
      return typeof rule.days === 'number' && rule.days > 0;
    }

    if (kind === SegmentRuleKind.VIP) {
      return (
        typeof rule.days === 'number' &&
        rule.days > 0 &&
        typeof rule.minSpend === 'number' &&
        rule.minSpend >= 0
      );
    }

    if (kind === SegmentRuleKind.RISK) {
      return typeof rule.inactiveDays === 'number' && rule.inactiveDays > 0;
    }

    if (kind === SegmentRuleKind.SEGMENT_COMPOSITION) {
      const hasSegmentIds =
        Array.isArray(rule.segmentIds) &&
        rule.segmentIds.every((id) => typeof id === 'string' && id.length > 0);
      const hasOperator =
        rule.operator === SegmentCompositionOperator.INTERSECTION ||
        rule.operator === SegmentCompositionOperator.UNION;
      return hasSegmentIds && hasOperator;
    }

    if (kind === SegmentRuleKind.MANUAL_SNAPSHOT) {
      return true;
    }

    return false;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'rules has invalid shape for provided kind.';
  }
}
