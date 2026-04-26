import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { CustomerService } from '../../services';
import { CustomerResponse } from '../../types';

export const CustomerDetailResolve: ResolveFn<CustomerResponse | null> = (
  route: ActivatedRouteSnapshot,
) => {
  const id = route.paramMap.get('id');
  const customerService = inject(CustomerService);
  const router = inject(Router);

  if (!id) {
    router.navigate(['/customers']);
    return of(null);
  }

  return customerService.getCustomerDetails(id).pipe(
    tap((customer) => {
      if (!customer) router.navigate(['/customers']);
    }),
    catchError(() => {
      router.navigate(['/customers']);
      return of(null);
    }),
  );
};
