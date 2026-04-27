import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  navLinks = [
    { href: '/transactions', label: 'transactions' },
    { href: '/dashboard', label: 'dashboard' }
  ];


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
