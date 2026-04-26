import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, Endpoints } from '../../../api';
import { CreateCustomerRequest, CustomerResponse } from '../types';

@Injectable({
  providedIn: 'root',
})
export class CustomerApi {
  readonly #api = inject(ApiClient);
  readonly #baseUrl = this.#api.baseUrls.customer;

  createCustomer(payload: CreateCustomerRequest): Observable<CustomerResponse> {
    return this.#api.post<CustomerResponse>(
      this.#baseUrl,
      Endpoints.customer.createCustomer,
      payload,
    );
  }
  getAllCustomers(): Observable<CustomerResponse[]> {
    return this.#api.get<CustomerResponse[]>(this.#baseUrl, Endpoints.customer.getCustomers);
  }

  getCustomerDetails(id: string): Observable<CustomerResponse> {
    return this.#api.get<CustomerResponse>(this.#baseUrl, Endpoints.customer.getCustomerId(id));
  }

  deleteCustomer(id: string): Observable<CustomerResponse> {
    return this.#api.delete<CustomerResponse>(this.#baseUrl, Endpoints.customer.deleteCustomer(id));
  }
}
