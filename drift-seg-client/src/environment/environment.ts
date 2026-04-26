import { Environment } from './environment.model';

export const environment = {
  production: false,
  customer: '/api/customer',
  transactions: '/api/transaction',
  segments: '/api/segments',
  segmentSocketUrl: 'http://localhost:3001',
} satisfies Environment;
