import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, Endpoints } from '@api';
import { CreateTransactionRequest, TransactionResponse } from '../types';

@Injectable({
  providedIn: 'root',
})
export class TransactionApi {
  readonly #api = inject(ApiClient);
  readonly #baseUrl = this.#api.baseUrls.transactions;

  createTransaction(payload: CreateTransactionRequest): Observable<TransactionResponse> {
    return this.#api.post<TransactionResponse>(
      this.#baseUrl,
      Endpoints.transactions.createTransaction,
      payload,
    );
  }

  getAllTransactions(): Observable<TransactionResponse[]> {
    return this.#api.get<TransactionResponse[]>(
      this.#baseUrl,
      Endpoints.transactions.getTransactions,
    );
  }
}
