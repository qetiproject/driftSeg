// Component field initializer
import { signal } from '@angular/core';
import { apply, form } from '@angular/forms/signals';
import { createEmailSchema, createNameSchema } from '../../../features/custom-signal-form';
import { CreateSegmentForm, SegmentTypeEnum } from '../types';

export const createSegmentModel = () =>
  signal<CreateSegmentForm>({
    name: '',
    type: SegmentTypeEnum.Dynamic,
    rules: SegmentRules.kind.ACTIVE_BUYERS,
    dependsOnSegmentIds?: []
  });

export const createCustomerForm = (model: ReturnType<typeof createSegmentModel>) =>
  form(model, (path) => {
    apply(path.firstName, createNameSchema('First Name'));
    apply(path.lastName, createNameSchema('Last Name'));
    apply(path.email, createEmailSchema());
  });
