import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EditSVG } from '../../../../../assets/icons/edit';
import { RemoveSVG } from '../../../../../assets/icons/remove';
import { CustomerService } from '../../services';
import { CustomerResponse } from '../../types/customer.interface';

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
    const { _id } = this.customer();

    this.#customerService.deleteCustomer(_id);
  }
}
