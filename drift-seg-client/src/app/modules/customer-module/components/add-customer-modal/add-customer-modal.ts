import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../core/services';
import { FieldInput } from '../../../../features/custom-signal-form';
import { INPUT_TYPES, MessageSeverity } from '@types';
import { CustomerService } from '../../services';
import { createCustomerForm, createCustomerModel } from '../../utils';

@Component({
  selector: 'app-add-customer-modal',
  standalone: true,
  imports: [FieldInput, FormField],
  templateUrl: './add-customer-modal.html',
})
export class AddCustomerModal {
  readonly INPUT_TYPES = INPUT_TYPES;
  readonly #customerService = inject(CustomerService);
  readonly #messages = inject(MessagesService);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  readonly createCustomerModel = createCustomerModel;
  readonly customerForm = createCustomerForm(this.createCustomerModel());

  onCloseModal(): void {
    this.#router.navigate([{ outlets: { modal: null } }], {
      relativeTo: this.#route.parent,
    });
  }

  onAddCustomerEvent(event: Event): void {
    event.preventDefault();
    const payload = this.customerForm().value();
    this.#customerService.createCustomer(payload).subscribe({
      next: () => {
        this.#messages.showMessage({
          text: 'Customer created successfully.',
          severity: MessageSeverity.Success,
        });
        this.onCloseModal();
      },
      error: (error: unknown) => {
        this.#messages.showMessage({
          text: this.resolveCreateErrorMessage(error),
          severity: MessageSeverity.Error,
        });
      },
    });
  }

  private resolveCreateErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Failed to create customer. Please try again.';
    }

    const backendMessage =
      typeof error.error?.message === 'string'
        ? error.error.message
        : Array.isArray(error.error?.message)
          ? error.error.message.join(', ')
          : '';

    if (backendMessage) {
      return backendMessage;
    }

    return error.message || 'Failed to create customer. Please try again.';
  }
}
