import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'customers',
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('./modules/customer-module/customer-router').then((r) => r.customerRoutes),
  },
  {
    path: 'transactions',
    loadComponent: () => import('./modules/customer-module/pages').then((p) => p.Transactions),
    children: [
      {
        path: 'add',
        outlet: 'modal',
        loadComponent: () =>
          import('./modules/customer-module/components').then((c) => c.AddTransactionModal),
      },
    ],
  },
  {
    path: 'segments',
    loadChildren: () =>
      import('./modules/segment-module/segment-router').then((r) => r.segmentRoutes),
  },
  { path: '**', loadComponent: () => import('@pages/not-found').then((m) => m.NotFoundComponent) },
];
