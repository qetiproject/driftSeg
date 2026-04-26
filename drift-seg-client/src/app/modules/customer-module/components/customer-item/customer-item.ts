import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { CustomerResponse } from '../../types/customer.interface';

@Component({
  selector: 'app-customer-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-item.html',
})
export class CustomerItem {
  customer = input.required<CustomerResponse>()
}
