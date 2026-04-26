import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TransactionService } from '../../services';
import { TransactionItem } from '../transaction-item/transaction-item';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, TransactionItem],
  templateUrl: './transaction-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionList {
  readonly #transactionService = inject(TransactionService);
  readonly transactions = this.#transactionService.transactions;

  constructor() {
    this.#transactionService.getTransactions();
  }
}
