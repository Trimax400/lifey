import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../services/supabase';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);
  
  signupForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  async onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password } = this.signupForm.value;

    try {
      const { data, error } = await this.supabaseService.signUp(email, password);

      if (error) {
        this.errorMessage = error.message;
      } else {
        this.successMessage = 'Successfully registered ! Check your email box to confirm your email.';
        this.signupForm.reset();
      }
    } catch (err: any) {
      this.errorMessage = 'Une erreur inattendue est survenue.';
    } finally {
      this.isLoading = false;
    }
  }
}
