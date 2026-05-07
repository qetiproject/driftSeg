import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, Endpoints } from '@api';
import {
  CreateTransactionRequest,
  PaginatedTransactionsResponse,
  TransactionResponse,
} from '../types';

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

  getAllTransactions(): Observable<PaginatedTransactionsResponse> {
    return this.#api.get<PaginatedTransactionsResponse>(
      this.#baseUrl,
      Endpoints.transactions.getTransactions,
    );
  }
}
