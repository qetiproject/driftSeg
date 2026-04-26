import { inject, Injectable, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { TransactionResponse } from '../types';
import { TransactionApi } from './transaction.api';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  readonly #transactionApi = inject(TransactionApi);
  readonly #transactions = signal<TransactionResponse[]>([]);

  readonly transactions = this.#transactions.asReadonly();

  getTransactions(): void {
    this.#transactionApi
      .getAllTransactions()
      .pipe(catchError(() => of([])))
      .subscribe((transactions) => this.#transactions.set(transactions));
  }
}
