import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { TransactionResponse } from '../../types';

@Component({
  selector: 'tr[app-transaction-item]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-item.html',
})
export class TransactionItem {
  transaction = input.required<TransactionResponse>();
}
