import { Component } from '@angular/core';

@Component({
  selector: 'app-plus-svg',
  standalone: true,
  imports: [],
  template: ` <svg
    class="w-5 h-5 mr-2"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
  </svg>`,
})
export class PlusSVG {}
