import { Component, OnInit, ChangeDetectorRef, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  userEmail = signal<string>('');
  createdAt = signal<string>('');

  newPassword = signal<string>('');
  confirmPassword = signal<string>('');

  isLoading = signal<boolean>(true);
  isUpdating = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      const { data: { user }, error } = await this.supabaseService.supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        this.userEmail.set(user.email || '');
        this.createdAt.set(user.created_at);
      }
    } catch (error: any) {
      this.errorMessage.set(error.message);
    } finally {
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  async onUpdatePassword() {
    this.successMessage.set('');
    this.errorMessage.set('');
    
    const newPass = this.newPassword();
    const confirmPass = this.confirmPassword();

    if (!newPass || newPass.length < 6) {
      this.errorMessage.set('The password must be at least 6 characters long.');
      return;
    }

    if (newPass !== confirmPass) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isUpdating.set(true);
    try {
      const { error } = await this.supabaseService.updatePassword(newPass);
      if (error) throw error;

      this.successMessage.set('Your password has been updated successfully.');
      this.newPassword.set('');
      this.confirmPassword.set('');
    } catch (error: any) {
      this.errorMessage.set('An error occurred: ' + error.message);
    } finally {
      this.isUpdating.set(false);
      this.cdr.detectChanges();
    }
  }
}
