import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { TransactionService } from '../../services';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './transactions.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transactions {
  readonly #transactionService = inject(TransactionService);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly transactions = this.#transactionService.transactions;

  constructor() {
    this.#transactionService.getTransactions();
  }

  onAddTransaction(): void {
    this.#router.navigate([{ outlets: { modal: ['add'] } }], { relativeTo: this.#route });
  }
}
