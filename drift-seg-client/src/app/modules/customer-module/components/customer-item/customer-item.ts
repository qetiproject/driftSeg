import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-item.html',
})
export class CustomerItem {}
