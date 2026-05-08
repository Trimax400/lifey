import { Component, inject, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html'
})
export class HeaderComponent {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  navLinks = signal([
    { href: '/transactions', label: 'transactions' },
    { href: '/dashboard', label: 'dashboard' }
  ]);


  async logout() {
    try {
      const { error } = await this.supabaseService.signOut();
      
      if (!error) {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
    }
  }
}
