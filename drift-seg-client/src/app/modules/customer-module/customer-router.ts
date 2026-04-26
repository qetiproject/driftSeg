import { Routes } from "@angular/router";

export const customerRoutes: Routes = [
   {
    path: 'customers',
    loadComponent: () => import('../customer-module/pages/customers/customers').then(c => c.Customers),
  },
]