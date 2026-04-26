import { Environment } from './environment.model';

export const environment = {
  production: false,
  customer: 'http://localhost:3000/api/customer',
  transactions: 'http://localhost:3000/api/transaction',
  segments: 'http://localhost:3001/api/segments',
  segmentSocketUrl: 'http://localhost:3001',
} satisfies Environment;
