import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CustomerService } from '../../services';
import { CustomerItem } from '../customer-item/customer-item';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CustomerItem],
  templateUrl: './customer-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerList {
  readonly #customerService = inject(CustomerService);

  readonly customers = this.#customerService.customers;

  constructor() {
    this.#customerService.getCustomers();
  }
}
