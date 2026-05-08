import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/shared/sidebar/sidebar';
import { FooterComponent } from './components/shared/footer/footer';

@Component({
  selector: 'app-root',
  imports:
    [RouterOutlet,
      RouterLink,
      SidebarComponent,
      FooterComponent],
  standalone: true,
  templateUrl: './app.html'
})
export class App {

  isMobileMenuOpen = signal<boolean>(false);

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
