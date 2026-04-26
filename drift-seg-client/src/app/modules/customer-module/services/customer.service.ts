import { Injectable, inject, signal } from '@angular/core';
import { CustomerResponse } from '../types/customer.interface';
import { CustomerApi } from './customer.api';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  readonly #customerApi = inject(CustomerApi);
  readonly #customers = signal<CustomerResponse[]>([]);

  readonly customers = this.#customers.asReadonly();

  getCustomers(): void {
    this.#customerApi.getAllCustomers().subscribe({
      next: (customers) => this.#customers.set(customers),
      error: () => this.#customers.set([]),
    });
  }
}