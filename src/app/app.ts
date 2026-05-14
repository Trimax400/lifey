import { Component, signal, inject, computed } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SidebarComponent } from './components/shared/sidebar/sidebar';
import { FooterComponent } from './components/shared/footer/footer';
import { LanguageSwitcherComponent } from './components/shared/language-switcher/language-switcher';
import { ThemeSwitcherComponent } from './components/shared/theme-switcher/theme-switcher';

@Component({
  selector: 'app-root',
  imports:
    [RouterOutlet,
      RouterLink,
      SidebarComponent,
      FooterComponent,
      LanguageSwitcherComponent,
      ThemeSwitcherComponent],
  standalone: true,
  templateUrl: './app.html'
})
export class App {
  private router = inject(Router);

  isMobileMenuOpen = signal<boolean>(false);

  showSidebar = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.isSidebarVisible()),
      startWith(this.isSidebarVisible())
    ),
    { initialValue: this.isSidebarVisible() }
  );

  private isSidebarVisible(): boolean {
    const url = this.router.url;
    const guestRoutes = ['/login', '/signup', '/forgot-password', '/update-password'];
    return !guestRoutes.some(route => url.includes(route));
  }

  private touchStartX = 0;
  private touchEndX = 0;
  private touchStartY = 0;
  private touchEndY = 0;

  protected readonly title = signal('lifey');

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].clientX;
    this.touchStartY = event.changedTouches[0].clientY;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].clientX;
    this.touchEndY = event.changedTouches[0].clientY;
    this.handleSwipeGesture();
  }

  private handleSwipeGesture() {
    const swipeDistanceX = this.touchEndX - this.touchStartX;
    const swipeDistanceY = this.touchEndY - this.touchStartY;

    if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
      if (swipeDistanceX > 50 && this.touchStartX < 100) {
        this.isMobileMenuOpen.set(true);
      }
      else if (swipeDistanceX < -50 && this.isMobileMenuOpen()) {
        this.isMobileMenuOpen.set(false);
      }
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
