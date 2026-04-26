import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
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
  INPUT_TYPES = INPUT_TYPES;
  #customerService = inject(CustomerService);

  readonly createCustomerModel = createCustomerModel;
  readonly customerForm = createCustomerForm(this.createCustomerModel());

  async onAddCustomerEvent(event: any): Promise<void> {
    console.log(this.customerForm, 'form');

    // await this.#customerService.createCustomer(this.customerForm().value());
  }
}
