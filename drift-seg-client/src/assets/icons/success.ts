import { Component } from '@angular/core';

@Component({
  selector: 'app-success-svg',
  standalone: true,
  template: `
    <svg
      class="mx-auto h-16 w-16 text-green-500 mb-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  `,
})
export class SuccessSVG {}
