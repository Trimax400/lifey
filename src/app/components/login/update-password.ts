import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './update-password.html',
})
export class UpdatePasswordComponent {
  updatePasswordForm: FormGroup;
  message: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.updatePasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  async updatePassword() {
    if (this.updatePasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.errorMessage = '';

    const newPassword = this.updatePasswordForm.get('password')?.value;

    try {
      const { error } = await this.supabaseService.updatePassword(newPassword);

      if (error) {
        this.errorMessage = error.message;
      } else {
        this.message = 'Your password has been successfully updated.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'An unknown error occurred.';
    } finally {
      this.isLoading = false;
    }
  }
}