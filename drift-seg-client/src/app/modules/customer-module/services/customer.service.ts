import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { CreateCustomerRequest, CustomerResponse } from '../types';
import { CustomerApi } from './customer.api';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  readonly #customerApi = inject(CustomerApi);
  readonly #customers = signal<CustomerResponse[]>([]);

  readonly customers = this.#customers.asReadonly();

  createCustomer(payload: CreateCustomerRequest): Observable<CustomerResponse> {
    return this.#customerApi.createCustomer(payload).pipe(
      tap((createdCustomer) => {
        this.#customers.update((customers) => [createdCustomer, ...customers]);
      }),
    );
  }

  getCustomers(): void {
    this.#customerApi
      .getAllCustomers()
      .pipe(catchError(() => of({ items: [], totalItems: 0, totalPages: 0, page: 1, limit: 10 })))
      .subscribe((response) => this.#customers.set(response.items));
  }

  getCustomerDetails(id: string): Observable<CustomerResponse | null> {
    return this.#customerApi.getCustomerDetails(id).pipe(catchError(() => of(null)));
  }

  deleteCustomer(id: string): void {
    this.#customerApi
      .deleteCustomer(id)
      .pipe(catchError(() => of(null)))
      .subscribe((removedCustomer) => {
        if (!removedCustomer) return;
        this.#customers.update((customers) =>
          customers.filter((customer) => customer._id !== removedCustomer._id),
        );
      });
  }
}
