import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CustomerList } from '../../components/customer-list/customer-list';
import { CustomerPageHeader } from '../../components/customer-page-header/customer-page-header';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, CustomerPageHeader, CustomerList],
  templateUrl: './customers.html',
})
export class Customers {
  // readonly #customerService = inject(CustomerService);

  // readonly customers$: Observable<CustomerResponse[]> = this.#customerService
  //   .getAllCustomers()
  //   .pipe(catchError(() => of([])));
}
