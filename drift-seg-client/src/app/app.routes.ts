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
  { path: '**', loadComponent: () => import('./pages/not-found').then((m) => m.NotFoundComponent) },
];
