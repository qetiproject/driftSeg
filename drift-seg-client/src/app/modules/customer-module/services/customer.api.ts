import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, Endpoints } from '../../../api';
import { CustomerResponse } from '../types/customer.interface';

@Injectable({
  providedIn: 'root',
})
export class CustomerApi {
  readonly #api = inject(ApiClient);
  readonly #baseUrl = this.#api.baseUrls.customer;

  getAllCustomers(): Observable<CustomerResponse[]> {
    return this.#api.get<CustomerResponse[]>(
      this.#baseUrl,
      Endpoints.customer.getCustomers,
    );
  }
}
