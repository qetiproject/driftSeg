import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { INPUT_TYPES, MessageSeverity } from '@types';
import { MessagesService } from '../../../../core/services';
import { FieldInput } from '../../../../features/custom-signal-form';
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
    });
  }
}
