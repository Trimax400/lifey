import { Component, inject, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, LanguageSwitcherComponent, ThemeSwitcherComponent],
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  navCategories = signal([
    {
      title: $localize`:@@sidebar.category.main:Main`,
      links: [
        { href: '/dashboard', label: $localize`:@@nav.dashboard:dashboard` },
        { href: '/transactions', label: $localize`:@@nav.transactions:transactions` },
      ]
    },
    {
      title: $localize`:@@sidebar.category.settings:Settings`,
      links: [
        { href: '/profile', label: $localize`:@@nav.profile:profile`}
      ]
    }
  ]);


  async logout() {
    try {
      const { error } = await this.supabaseService.signOut();
      
      if (!error) {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error($localize`:@@sidebar.error.logout:Unexpected error during logout:`, error);
    }
  }
}
