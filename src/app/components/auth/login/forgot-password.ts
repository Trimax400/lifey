import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent {
  private supabaseService = inject(SupabaseService);

  email = signal('');
  message = signal('');
  errorMessage = signal('');
  isLoading = signal(false);


  async resetPassword() {
    if (!this.email()) {
      this.errorMessage.set($localize`:@@forgotPassword.error.missingEmail:Put your email address.`);
      return;
    }

    this.isLoading.set(true);
    this.message.set('');
    this.errorMessage.set('');

    try {
      const { error } = await this.supabaseService.resetPasswordForEmail(this.email(), {
        redirectTo: `${environment.serverUrl}/update-password`,
      });

      if (error) {
        this.errorMessage.set(error.message);
      } else {
        this.message.set($localize`:@@forgotPassword.success.emailSent:A password reset link has been sent to your email address.`);
      }
    } catch (err: any) {
      this.errorMessage.set(err.message || $localize`:@@auth.error.unknown:An unknown error occurred.`);
    } finally {
      this.isLoading.set(false);
    }
  }
}
