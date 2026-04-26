import { Environment } from './environment.model';

export const environment = {
  production: false,
  customer: '/api/customer',
  transactions: '/api/transaction',
  segments: 'http://localhost:3001/api/segment',
} satisfies Environment;
