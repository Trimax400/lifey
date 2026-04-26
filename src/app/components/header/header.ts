import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  navLinks = [
    { href: '/', label: 'home' },
    { href: '/dashboard', label: 'dashboard' }
  ];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

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
