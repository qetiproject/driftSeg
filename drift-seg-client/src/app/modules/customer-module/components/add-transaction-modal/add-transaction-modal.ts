import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { INPUT_TYPES, MessageSeverity } from '@types';
import { MessagesService } from 'app/core/services';
import { FieldInput } from '../../../../features/custom-signal-form';
import { TransactionService } from '../../services';
import { createTransactionForm, createTransactionModel } from '../../utils';

@Component({
  selector: 'app-add-transaction-modal',
  standalone: true,
  imports: [FieldInput, FormField],
  templateUrl: './add-transaction-modal.html',
})
export class AddTransactionModal {
  readonly INPUT_TYPES = INPUT_TYPES;
  readonly #transactionService = inject(TransactionService);
  readonly #messages = inject(MessagesService);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  readonly createTransactionModel = createTransactionModel;
  readonly transactionForm = createTransactionForm(this.createTransactionModel());

  onCloseModal(): void {
    this.#router.navigate([{ outlets: { modal: null } }], {
      relativeTo: this.#route.parent,
    });
  }

  onAddTransactionEvent(event: Event): void {
    event.preventDefault();
    const value = this.transactionForm().value();

    const obj = {
      customerId: value.customerId,
      amount: value.amount,
      occurredAt: value.occurredAt,
      description: value.description,
    };
    this.#transactionService.createTransaction(obj).subscribe({
      next: () => {
        this.#messages.showMessage({
          text: 'Transaction created successfully.',
          severity: MessageSeverity.Success,
        });
        this.onCloseModal();
      },
    });
  }
}
