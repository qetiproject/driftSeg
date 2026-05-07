import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { CreateTransactionRequest, TransactionResponse } from '../types';
import { TransactionApi } from './transaction.api';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  readonly #transactionApi = inject(TransactionApi);
  readonly #transactions = signal<TransactionResponse[]>([]);

  readonly transactions = this.#transactions.asReadonly();

  createTransaction(payload: CreateTransactionRequest): Observable<TransactionResponse> {
    return this.#transactionApi.createTransaction(payload).pipe(
      tap((createdTransaction) => {
        this.#transactions.update((transactions) => [createdTransaction, ...transactions]);
      }),
    );
  }

  getTransactions(): void {
    this.#transactionApi
      .getAllTransactions()
      .pipe(catchError(() => of({ items: [], totalItems: 0, totalPages: 0, page: 1, limit: 10 })))
      .subscribe((response) => this.#transactions.set(response.items));
  }
}
