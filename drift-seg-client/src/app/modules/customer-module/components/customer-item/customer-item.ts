import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EditSVG, RemoveSVG } from '../../../../../assets/icons';
import { CustomerService } from '../../services';
import { CustomerResponse } from '../../types';

@Component({
  selector: 'app-customer-item',
  standalone: true,
  imports: [CommonModule, RouterLink, EditSVG, RemoveSVG],
  templateUrl: './customer-item.html',
})
export class CustomerItem {
  customer = input.required<CustomerResponse>();
  readonly #customerService = inject(CustomerService);

  async onOpenModal(): Promise<void> {
    const { _id, firstName, lastName, email } = this.customer();
    const isConfirmed = window.confirm(
      `Delete customer "${firstName} ${lastName}" (${email})? This action cannot be undone.`,
    );

    if (!isConfirmed) return;

    this.#customerService.deleteCustomer(_id);
  }
}
