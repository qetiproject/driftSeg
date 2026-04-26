import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { BackButtonComponent } from '../../../../components/index';
import { CustomerResponse } from '../../types/customer.interface';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, BackButtonComponent],
  templateUrl: './customer-details.html',
})
export class CustomerDetails {
  readonly #route = inject(ActivatedRoute);

  customerDetails = toSignal<CustomerResponse | null>(
    this.#route.data.pipe(map((d: { customer?: CustomerResponse | null }) => d.customer ?? null)),
    {
      initialValue: null,
    },
  );
}
