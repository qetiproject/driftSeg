import { inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs/operators';
import { CustomerResponse } from '../types/customer.interface';
import { CustomerApi } from './customer.api';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  readonly #customerApi = inject(CustomerApi);
  readonly #customers = signal<CustomerResponse[]>([]);

  readonly customers = this.#customers.asReadonly();

  loadAllCustomers(): void {
    this.#customerApi
      .getAllCustomers()
      .pipe(take(1))
      .subscribe({
        next: (customers) => this.#customers.set(customers),
        error: () => this.#customers.set([]),
      });
  }
}
