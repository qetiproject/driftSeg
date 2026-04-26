import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-segment-page-header',
  standalone: true,
  imports: [],
  templateUrl: './segment-page-header.html',
})
export class SegmentPageHeader {
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);

  onAddSegment(): void {
    this.router.navigate([{ outlets: { modal: ['add'] } }], { relativeTo: this.route });
  }
}
