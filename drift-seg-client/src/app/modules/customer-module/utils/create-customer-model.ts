// Component field initializer
import { signal } from '@angular/core';
import { apply, form } from '@angular/forms/signals';
import { createEmailSchema, createNameSchema } from '../../../features/custom-signal-form';
import { CreateCustomerForm } from '../types';

export const createCustomerModel = () =>
  signal<CreateCustomerForm>({
    firstName: '',
    lastName: '',
    email: '',
  });

export const createCustomerForm = (model: ReturnType<typeof createCustomerModel>) =>
  form(model, (path) => {
    apply(path.firstName, createNameSchema('First Name'));
    apply(path.lastName, createNameSchema('Last Name'));
    apply(path.email, createEmailSchema());
  });
