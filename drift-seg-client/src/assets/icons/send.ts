import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-send-svg',
  standalone: true,
  imports: [NgClass],
  template: `
    <svg
      [ngClass]="customClasses()"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 10l9-7 0 14-9-7zm0 0h12"
      />
    </svg>
  `,
})
export class SendSVG {
  customClasses = input<string>('w-5 h-5');
}
