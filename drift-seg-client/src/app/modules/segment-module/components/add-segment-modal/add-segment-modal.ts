import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { INPUT_TYPES, MessageSeverity } from '@types';
import { MessagesService } from '../../../../core/services';
import { FieldInput } from '../../../../features/custom-signal-form';
import { SegmentService } from '../../services/segment.service';
import { SegmentTypeEnum, SegmentkindEnum } from '../../types';
import {
  createSegmentModel,
  SEGMENT_RULE_DEFAULTS,
  toCreateSegmentRequest,
} from '../../utils/create-segment-modal';

@Component({
  selector: 'app-add-segment-modal',
  standalone: true,
  imports: [FieldInput],
  templateUrl: './add-segment-modal.html',
})
export class AddSegmentModal {
  readonly INPUT_TYPES = INPUT_TYPES;
  readonly SegmentTypeEnum = SegmentTypeEnum;
  readonly SegmentkindEnum = SegmentkindEnum;
  readonly defaults = SEGMENT_RULE_DEFAULTS;

  readonly #segmentService = inject(SegmentService);
  readonly #messages = inject(MessagesService);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  readonly form = createSegmentModel();
  readonly isDynamic = computed(() => this.form().type === SegmentTypeEnum.Dynamic);
  readonly isStatic = computed(() => this.form().type === SegmentTypeEnum.Static);

  readonly isActiveRule = computed(
    () => this.form().type === SegmentTypeEnum.Dynamic && this.form().ruleKind === SegmentkindEnum.ACTIVE_BUYERS,
  );
  readonly isVipRule = computed(
    () => this.form().type === SegmentTypeEnum.Dynamic && this.form().ruleKind === SegmentkindEnum.VIP,
  );
  readonly isRiskRule = computed(
    () => this.form().type === SegmentTypeEnum.Dynamic && this.form().ruleKind === SegmentkindEnum.RISK,
  );

  onCloseModal(): void {
    this.#router.navigate([{ outlets: { modal: null } }], {
      relativeTo: this.#route.parent,
    });
  }

  onTypeChange(type: SegmentTypeEnum): void {
    this.form.update((value) => ({
      ...value,
      type,
      ...(type === SegmentTypeEnum.Static ? { staticSegmentKind: value.staticSegmentKind || 'manual_refresh' } : {}),
    }));
  }

  onRuleKindChange(ruleKind: SegmentkindEnum): void {
    this.form.update((value) => ({ ...value, ruleKind }));
  }

  updateTextField<K extends 'name' | 'dependsOnSegmentIds' | 'staticSegmentKind'>(
    key: K,
    value: string,
  ): void {
    this.form.update((state) => ({ ...state, [key]: value }));
  }

  updateNumberField<K extends 'days' | 'minSpend' | 'inActiveDays'>(key: K, value: string): void {
    this.form.update((state) => ({ ...state, [key]: value }));
  }

  private validate(value: ReturnType<typeof this.form>): string[] {
    const errors: string[] = [];

    if (value.name.trim().length < 2) {
      errors.push('Segment name must be at least 2 characters.');
    }

    if (value.dependsOnSegmentIds.trim().length > 0) {
      const ids = value.dependsOnSegmentIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      const mongoIdRegex = /^[a-fA-F0-9]{24}$/;
      const hasInvalid = ids.some((id) => !mongoIdRegex.test(id));
      if (hasInvalid) {
        errors.push('Depends On IDs must be valid Mongo IDs (24 hex chars), comma separated.');
      }
    }

    if (value.type === SegmentTypeEnum.Static) {
      if (!value.staticSegmentKind?.trim()) {
        errors.push('Static segment kind is required for static segments.');
      }
      return errors;
    }

    if (value.ruleKind === SegmentkindEnum.ACTIVE_BUYERS && Number(value.days) !== this.defaults.activeDays) {
      errors.push(`Active buyers rule requires days = ${this.defaults.activeDays}.`);
    }

    if (value.ruleKind === SegmentkindEnum.VIP) {
      if (Number(value.days) !== this.defaults.vipDays) {
        errors.push(`VIP rule requires days = ${this.defaults.vipDays}.`);
      }
      if (Number(value.minSpend) < this.defaults.vipMinSpend) {
        errors.push(`VIP rule requires minSpend >= ${this.defaults.vipMinSpend}.`);
      }
    }

    if (value.ruleKind === SegmentkindEnum.RISK && Number(value.inActiveDays) !== this.defaults.riskInactiveDays) {
      errors.push(`Risk rule requires inActiveDays = ${this.defaults.riskInactiveDays}.`);
    }

    return errors;
  }

  onAddSegmentEvent(event: Event): void {
    event.preventDefault();
    const value = this.form();
    const errors = this.validate(value);

    if (errors.length > 0) {
      for (const message of errors) {
        this.#messages.showMessage({
          text: message,
          severity: MessageSeverity.Error,
        });
      }
      return;
    }

    const payload = toCreateSegmentRequest(value);
    this.#segmentService.createSegment(payload).subscribe({
      next: () => {
        this.#messages.showMessage({
          text: 'Segment created successfully.',
          severity: MessageSeverity.Success,
        });
        this.onCloseModal();
      },
    });
  }
}
