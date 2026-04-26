import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CustomerResponse } from '../../types/customer.interface';

@Component({
  selector: 'app-customer-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-item.html',
})
export class CustomerItem {
  @Input({ required: true }) customer!: CustomerResponse;
}
