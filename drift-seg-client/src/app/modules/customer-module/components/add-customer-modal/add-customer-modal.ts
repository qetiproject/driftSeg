import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MessageSeverity } from '@app-types/message';
import { MessagesService } from '@core/services/messages.service';
import { FormField } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldInput } from '../../../../features/custom-signal-form';
import { INPUT_TYPES } from '../../../../types/input';
import { CustomerService } from '../../services';
import { createCustomerForm, createCustomerModel } from '../../utils/create-customer-model';

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
  readonly submitError = signal<string | null>(null);

  onCloseModal(): void {
    this.#router.navigate([{ outlets: { modal: null } }], {
      relativeTo: this.#route.parent,
    });
  }

  onAddCustomerEvent(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);
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
        this.submitError.set(this.resolveCreateErrorMessage(error));
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

    const rawMessage = `${backendMessage} ${error.message}`.toLowerCase();
    if (error.status === 409 || rawMessage.includes('exist') || rawMessage.includes('duplicate')) {
      return 'Customer with this email already exists.';
    }

    return backendMessage || 'Failed to create customer. Please try again.';
  }
}
