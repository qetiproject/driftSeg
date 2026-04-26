/**
 * API endpoint path constants (path segments only, no base URL).
 * Base URLs come from environment (userApp, product, cart, api).
 */
export const Endpoints = {
  customer: {
    createCustomer: '/create',
    getCustomers: '/',
    getCustomerId: (id: string) => `/${id}`,
    updateCustomer: (id: string) => `/${id}`,
    deleteCustomer: (id: string) => `/${id}`
  },
} as const;
