import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TransactionList, TransactionPageHeader } from '../../components';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TransactionPageHeader, TransactionList],
  templateUrl: './transactions.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transactions {}
