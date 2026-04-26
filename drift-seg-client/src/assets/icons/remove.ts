import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-remove-svg',
  standalone: true,
  imports: [NgClass],
  template: `<svg
    [ngClass]="customClasses()"
    xmlns="http://www.w3.org/2000/svg"
    class="h-4 w-4 text-gray-700"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>`,
})
export class RemoveSVG {
  customClasses = input<string>('');
}
