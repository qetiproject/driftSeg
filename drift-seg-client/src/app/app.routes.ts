import { Routes } from '@angular/router';

export const routes: Routes = [

     {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./modules/customer-module/pages/customers/customers').then((c) => c.Customers),
  },
      {
    path: '',
    loadChildren: () =>
      import('./modules/customer-module/customer-router').then((r) => r.customerRoutes),
  },
  { path: '**', loadComponent: () => import('./pages/not-found').then((m) => m.NotFoundComponent) },
];
