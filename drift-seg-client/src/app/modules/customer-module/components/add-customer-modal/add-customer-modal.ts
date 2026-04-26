import { Component, inject, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../core/services/messages.service';
import { FieldInput } from '../../../../features/custom-signal-form';
import { INPUT_TYPES } from '../../../../types/input';
import { MessageSeverity } from '../../../../types/message';
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
    });
  }
}
