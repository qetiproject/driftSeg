import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerList } from '../../components/customer-list/customer-list';
import { CustomerPageHeader } from '../../components/customer-page-header/customer-page-header';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, CustomerPageHeader, CustomerList, RouterOutlet],
  templateUrl: './customers.html',
})
export class Customers {}
