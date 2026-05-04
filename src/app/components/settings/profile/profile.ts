import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  userEmail: string = '';
  createdAt: string = '';

  newPassword: string = '';
  confirmPassword: string = '';

  isLoading: boolean = true;
  isUpdating: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      const { data: { user }, error } = await this.supabaseService.supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        this.userEmail = user.email || '';
        this.createdAt = user.created_at;
      }
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async onUpdatePassword() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage = 'The password must be at least 6 characters long.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isUpdating = true;
    try {
      const { error } = await this.supabaseService.updatePassword(this.newPassword);
      if (error) throw error;

      this.successMessage = 'Your password has been updated successfully.';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (error: any) {
      this.errorMessage = 'An error occurred: ' + error.message;
    } finally {
      this.isUpdating = false;
      this.cdr.detectChanges();
    }
  }
}
