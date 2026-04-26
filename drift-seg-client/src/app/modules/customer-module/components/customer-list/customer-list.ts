import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CustomerService } from '../../services';
import { CustomerItem } from '../customer-item/customer-item';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CustomerItem],
  templateUrl: './customer-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerList implements OnInit{
  customerService = inject(CustomerService);

  customers = this.customerService.customers;

  ngOnInit(): void {
    this.customerService.loadAllCustomers();
  }
}
