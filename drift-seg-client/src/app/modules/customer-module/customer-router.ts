import { Routes } from "@angular/router";

export const customerRoutes: Routes = [
   {
    path: 'customer',
    loadComponent: () => import('../customer-module/pages/customers/customers').then(c => c.Customers),
  },
]