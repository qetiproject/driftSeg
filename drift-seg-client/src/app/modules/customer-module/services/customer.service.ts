import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerResponse } from '../types/customer.interface';
import { CustomerApi } from './customer.api';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  readonly #customerApi = inject(CustomerApi);

  getAllCustomers(): Observable<CustomerResponse[]> {
    return this.#customerApi.getAllCustomers();
  }
}
