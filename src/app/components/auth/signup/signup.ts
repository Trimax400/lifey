import { Component, inject, signal, WritableSignal } from '@angular/core';
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

  errorMessage: WritableSignal<string> = signal('');
  successMessage: WritableSignal<string> = signal('');
  isLoading: WritableSignal<boolean> = signal(false);

  async onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { email, password } = this.signupForm.value;

    try {
      const { data, error } = await this.supabaseService.signUp(email, password);

      if (error) {
        this.errorMessage.set(error.message);
      } else {
        this.successMessage.set($localize`:@@signup.success:Successfully registered ! Check your email box to confirm your email.`)
        this.signupForm.reset();
      }
    } catch (err: any) {
      this.errorMessage.set($localize`:@@auth.error.unknown:An unknown error occurred.`);
    } finally {
      this.isLoading.set(false);
    }
  }
}
