import { Environment } from './environment.model';

export const environment = {
  production: false,
  customer: '/api/customer',
  transactions: '/api/transactions',
  segments: 'http://localhost:3001/api/segments',
} satisfies Environment;
