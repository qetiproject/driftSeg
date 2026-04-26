import { minLength, pattern, required, Schema, schema } from '@angular/forms/signals';

export const createNameSchema = (label: string): Schema<string> =>
  schema((path) => {
    required(path, { message: `${label} is required` });
    minLength(path, 3, { message: `${label} length is too short` });
  });

export const createZipSchema = (): Schema<string> =>
  schema((path) => {
    required(path, { message: 'Zip Code is required' });
    minLength(path, 3, { message: 'Zip Code must be at least 3 digits' });
    pattern(path, /^\d+$/, { message: 'Zip Code must contain only digits' });
  });
