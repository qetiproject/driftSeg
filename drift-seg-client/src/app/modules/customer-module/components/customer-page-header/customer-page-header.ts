import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-customer-page-header',
  standalone: true,
  imports: [],
  templateUrl: './customer-page-header.html',
})
export class CustomerPageHeader {
  router = inject(Router);
  route = inject(ActivatedRoute);

  onAddCustomer(): void {
    this.router.navigate([{ outlets: { modal: ['add-customer'] } }], { relativeTo: this.route });
  }
}
