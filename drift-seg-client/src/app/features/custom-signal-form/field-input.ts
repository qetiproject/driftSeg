import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import {
  DisabledReason,
  FormValueControl,
  ValidationError,
  WithOptionalFieldTree,
} from '@angular/forms/signals';
import { INPUT_TYPES, InputType } from '@types';

@Component({
  selector: 'app-field-input',
  template: `
    @if (!hidden()) {
      <div class="input-container">
        <label for="label" class="block text-sm font-medium text-gray-700 mb-1">{{
          label()
        }}</label>
        <input
          class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xl bg-white shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-150"
          [type]="type()"
          [value]="value()"
          (input)="value.set($event.target.value)"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [class.invalid]="invalid()"
          [attr.aria-invalid]="invalid()"
          (blur)="touched.set(true)"
          (input)="dirty.set(true)"
          [placeholder]="placeholder() || 'Enter ' + label()"
        />
        @if (invalid() && (touched() || dirty())) {
          <div class="text-red-600 text-sm mt-1" role="alert">
            @for (error of errors(); track error.fieldTree) {
              <span class="error">{{ error.message }}</span>
            }
          </div>
        }
        @if (disabled() && disabledReasons().length > 0) {
          <div class="text-yellow-600 text-sm mt-1" role="alert">
            @for (reason of disabledReasons(); track reason.fieldTree) {
              <span>{{ reason.message }}</span>
            }
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldInput implements FormValueControl<string> {
  value = model<string>('');
  touched = model<boolean>(false);
  dirty = model<boolean>(false);
  disabled = input<boolean>(false);
  disabledReasons = input<readonly WithOptionalFieldTree<DisabledReason>[]>([]);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  invalid = input<boolean>(false);
  errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  label = input<string>();
  placeholder = input<string>();
  INPUT_TYPES = INPUT_TYPES;
  type = input<InputType>(INPUT_TYPES.TEXT);
}
