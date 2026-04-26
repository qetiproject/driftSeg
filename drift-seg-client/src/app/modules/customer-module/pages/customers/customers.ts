import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerList, CustomerPageHeader } from '../../components';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CustomerPageHeader, CustomerList],
  templateUrl: './customers.html',
})
export class Customers {}
