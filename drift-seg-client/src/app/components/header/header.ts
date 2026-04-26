import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

const HEADER_NAV_LINKS = [
  { path: '/customers', label: 'Customers' },
  { path: '/segments', label: 'Segments' },
] as const;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly isOpen = signal(false);
  readonly isMobileMenu = signal(false);
  readonly navLinks = HEADER_NAV_LINKS;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenus();
  }

  toggleDropdown(): void {
    this.isOpen.update((v) => !v);
  }

  toggleMobileMenu(): void {
    this.isMobileMenu.update((v) => !v);
  }

  closeMenus(): void {
    this.isOpen.set(false);
    this.isMobileMenu.set(false);
  }
}
