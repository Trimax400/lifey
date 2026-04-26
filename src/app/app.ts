import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { SupabaseService } from './services/supabase';

@Component({
  selector: 'app-root',
  imports: 
    [RouterOutlet,
    HeaderComponent, 
    FooterComponent],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('lifey');

  constructor(private supabaseService: SupabaseService) {}

  async login() {
    const { data, error } = await this.supabaseService.signIn('ton@email.com', 'ton-password');
    
    if (error) {
      console.error('Zut !', error.message);
    } else {
      console.log('Connecté !', data);
    }
  }
}
