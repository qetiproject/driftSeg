import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, Endpoints } from '@api';
import { TransactionResponse } from '../types';

@Injectable({
  providedIn: 'root',
})
export class TransactionApi {
  readonly #api = inject(ApiClient);
  readonly #baseUrl = this.#api.baseUrls.transactions;

  getAllTransactions(): Observable<TransactionResponse[]> {
    return this.#api.get<TransactionResponse[]>(
      this.#baseUrl,
      Endpoints.transactions.getTransactions,
    );
  }
}
