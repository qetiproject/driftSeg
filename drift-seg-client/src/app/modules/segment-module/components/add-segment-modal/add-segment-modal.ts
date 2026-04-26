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
import { validateCreateSegmentForm } from '../../utils/segment-form-validation';

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

  private showValidationErrors(messages: string[]): void {
    for (const message of messages) {
      this.#messages.showMessage({
        text: message,
        severity: MessageSeverity.Error,
      });
    }
  }

  onAddSegmentEvent(event: Event): void {
    event.preventDefault();
    const value = this.form();
    const errors = validateCreateSegmentForm(value);

    if (errors.length > 0) {
      this.showValidationErrors(errors);
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
