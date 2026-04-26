import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EditSVG } from '../../../../../assets/icons/edit';
import { RemoveSVG } from '../../../../../assets/icons/remove';
import { CustomerResponse } from '../../types/customer.interface';

@Component({
  selector: 'app-customer-item',
  standalone: true,
  imports: [CommonModule, RouterLink, EditSVG, RemoveSVG],
  templateUrl: './customer-item.html',
})
export class CustomerItem {
  customer = input.required<CustomerResponse>();

  onOpenModal(): void {}
}
