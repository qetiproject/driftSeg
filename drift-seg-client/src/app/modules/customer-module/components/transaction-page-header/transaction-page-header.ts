import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-transaction-page-header',
  standalone: true,
  imports: [],
  templateUrl: './transaction-page-header.html',
})
export class TransactionPageHeader {
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  onAddTransaction(): void {
    this.#router.navigate([{ outlets: { modal: ['add'] } }], { relativeTo: this.#route });
  }
}
