import { Environment } from "./environment.model";

export const environment = {
  production: false,
  customer: '/api/customer',
  transactions: '/api/transactions',
} satisfies Environment;