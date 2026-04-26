import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TransactionService } from '../../services';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transactions {
  readonly #transactionService = inject(TransactionService);
  readonly transactions = this.#transactionService.transactions;

  constructor() {
    this.#transactionService.getTransactions();
  }
}
