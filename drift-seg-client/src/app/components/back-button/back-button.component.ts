import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { BackButtonSVG } from '../../../assets/icons';
import { BackButtonDirective } from '../../features/directives';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [BackButtonDirective, BackButtonSVG],
  template: `
    <div class="pt-4 pl-4 mb-4">
      <button type="button" (click)="goBack()" appBackBtnClass aria-label="Go back">
        <app-back-button-svg />
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButtonComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  readonly fallbackUrl = input<string | string[]>('/customers');

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
    } else {
      const url = this.fallbackUrl();
      this.router.navigate(Array.isArray(url) ? url : [url]);
    }
  }
}
