import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../customer-module/pages/customers/customers').then((c) => c.Customers),
    children: [
      {
        path: 'add-customer',
        outlet: 'modal',
        loadComponent: () =>
          import('./components/add-customer-modal/add-customer-modal').then(
            (m) => m.AddCustomerModal,
          ),
      },
    ],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../customer-module/pages/customer-details/customer-details').then(
        (c) => c.CustomerDetails,
      ),
  },
];
