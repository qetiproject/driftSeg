import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages').then((p) => p.Customers),
    children: [
      {
        path: 'add',
        outlet: 'modal',
        loadComponent: () => import('./components').then((c) => c.AddCustomerModal),
      },
    ],
  },
  {
    path: ':id',
    loadComponent: () => import('./pages').then((p) => p.CustomerDetails),
  },
];
