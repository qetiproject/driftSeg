import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-customer-page-header',
  standalone: true,
  imports: [],
  templateUrl: './customer-page-header.html',
})
export class CustomerPageHeader {
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);

  onAddCustomer(): void {
    this.router.navigate([{ outlets: { modal: ['add'] } }], { relativeTo: this.route });
  }
}
