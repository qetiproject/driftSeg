import { Routes } from "@angular/router";

export const customerRoutes: Routes = [
   {
    path: '',
    loadComponent: () => import('../customer-module/pages/customers/customers').then(c => c.Customers),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../customer-module/pages/customer-details/customer-details').then(
        (c) => c.CustomerDetails,
      ),
  },
]