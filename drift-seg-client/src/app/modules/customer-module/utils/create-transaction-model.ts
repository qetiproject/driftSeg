import { signal } from '@angular/core';
import { apply, form, schema } from '@angular/forms/signals';
import { createAmountSchema, createNameSchema } from '../../../features/custom-signal-form';
import { CreateTransactionForm } from '../types';

export const createTransactionModel = () =>
  signal<CreateTransactionForm>({
    customerId: '',
    amount: 0,
    occurredAt: '',
    description: '',
  });

export const createTransactionForm = (model: ReturnType<typeof createTransactionModel>) =>
  form(model, (path) => {
    apply(path.customerId, createNameSchema('Customer ID'));
    apply(path.amount, createAmountSchema());
    apply(
      path.occurredAt,
      schema(() => {}),
    );
    apply(
      path.description,
      schema(() => {}),
    );
  });
