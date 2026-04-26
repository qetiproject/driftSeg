import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { BackButtonComponent } from '@components';
import { CustomerService } from '../../services';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, BackButtonComponent],
  templateUrl: './customer-details.html',
})
export class CustomerDetails {
  readonly #route = inject(ActivatedRoute);
  readonly #customerService = inject(CustomerService);

  readonly customer = toSignal(
    this.#route.paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      switchMap((id) => this.#customerService.getCustomerDetails(id)),
    ),
    { initialValue: null },
  );
}
