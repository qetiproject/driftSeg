import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { CustomerItem } from "../../components/customer-item/customer-item";
import { CustomerService } from '../../services/customer.service';
import { CustomerResponse } from '../../types/customer.interface';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, CustomerItem],
  templateUrl: './customers.html',
})
export class Customers {
  readonly #customerService = inject(CustomerService);

  readonly customers$: Observable<CustomerResponse[]> = this.#customerService
    .getAllCustomers()
    .pipe(catchError(() => of([])));
}
