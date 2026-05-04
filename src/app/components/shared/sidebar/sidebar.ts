import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  navCategories = [
    {
      title: 'Main',
      links: [
        { href: '/dashboard', label: 'dashboard' },
        { href: '/transactions', label: 'transactions' },
      ]
    },
    {
      title: 'Settings',
      links: [
        { href: '/profile', label: 'profile'}
      ]
    }
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
