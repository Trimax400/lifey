import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private supabaseService: SupabaseService) {}

  async resetPassword() {
    if (!this.email) {
      this.errorMessage = 'Put your email address.';
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.errorMessage = '';

    try {
      const { error } = await this.supabaseService.resetPasswordForEmail(this.email, {
        redirectTo: 'http://localhost:4200/update-password', 
      });

      if (error) {
        this.errorMessage = error.message;
      } else {
        this.message = 'A password reset link has been sent to your email address.';
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'An unknown error occurred.';
    } finally {
      this.isLoading = false;
    }
  }
}
