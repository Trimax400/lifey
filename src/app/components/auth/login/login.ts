import { Component, ChangeDetectorRef, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../services/supabase';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent implements OnInit {

  private fb = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMessage: WritableSignal<string> = signal('');
  successMessage: WritableSignal<string> = signal('');
  isLoading: WritableSignal<boolean> = signal(false);
  
  isEmailNotConfirmed: WritableSignal<boolean> = signal(false);
  resendMessage: WritableSignal<string> = signal('');
  isResending: WritableSignal<boolean> = signal(false);
  

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment && fragment.includes('type=signup')) {
        this.successMessage.set("Email confirmed. You can now log in.");
      }
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.resendMessage.set('');
    this.isEmailNotConfirmed.set(false);

    const { email, password } = this.loginForm.value;

    try {
      const result: any = await this.supabaseService.signIn(email, password);

      if (result && result.error) {
        this.errorMessage.set(result.error.message || 'Wrong email address or password. Please try again.');
        
        if (result.error.message.includes('Email not confirmed') || result.error.code === 'email_not_confirmed') {
          this.isEmailNotConfirmed.set(true);
          this.errorMessage.set("Your email is not confirmed yet. Check your inbox.");
        }
      } else {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      }
    } catch (err: any) {
      this.errorMessage.set(err?.error?.error_description || err?.error?.message || err?.message || 'Server error. Please retry later.');
    } finally {
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  async onResendConfirmation() {
    this.isResending.set(true);
    this.errorMessage.set('');
    
    const email = this.loginForm.get('email')?.value;

    try {
      const { data, error } = await this.supabaseService.resendConfirmation(email);

      if (error) {
        this.errorMessage.set("Error while sending mail : " + error.message);
      } else {
        this.isEmailNotConfirmed.set(false);
        this.resendMessage.set("Confirmation email sent ! Check your inbox.");
      }
    } catch (err) {
      this.errorMessage.set("An error occured while resending.");
    } finally {
      this.isResending.set(false);
      this.cdr.detectChanges();
    }
  }
}