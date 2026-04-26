/**
 * API endpoint path constants (path segments only, no base URL).
 * Base URLs come from environment (userApp, product, cart, api).
 */
export const Endpoints = {
  customer: {
    createCustomer: '/create',
    getCustomers: '/all',
    getCustomerId: (id: string) => `/${id}`,
    updateCustomer: (id: string) => `/${id}`,
    deleteCustomer: (id: string) => `/${id}`,
  },
  transactions: {
    createTransaction: '/create',
    getTransactions: '/all',
  },
  segments: {
    createSegment: '/create',
    getSegments: '/all',
    getSegmentMembers: (id: string) => `/${id}/members`,
    getSegmentDeltas: (id: string) => `/${id}/deltas`,
    refreshSegment: (id: string) => `/${id}/refresh`,
  },
} as const;
