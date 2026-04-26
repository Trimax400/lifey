import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  
  isEmailNotConfirmed: boolean = false;
  resendMessage: string = '';
  isResending: boolean = false;
  
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment && fragment.includes('type=signup')) {
        this.successMessage = "Email confirmed. You can now log in.";
      }
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.resendMessage = '';
    this.isEmailNotConfirmed = false;

    const { email, password } = this.loginForm.value;

    try {
      const result: any = await this.supabaseService.signIn(email, password);

      if (result && result.error) {
        this.errorMessage = result.error.message || 'Wrong email address or password. Please try again.';
        
        if (result.error.message.includes('Email not confirmed') || result.error.code === 'email_not_confirmed') {
          this.isEmailNotConfirmed = true;
          this.errorMessage = "Your email is not confirmed yet. Check your inbox.";
        }
      } else {
        this.router.navigate(['/']);
      }
    } catch (err: any) {
      console.error('Error while log in:', err);
      this.errorMessage = err?.error?.error_description || err?.error?.message || err?.message || 'Server error. Please retry later.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async onResendConfirmation() {
    this.isResending = true;
    this.errorMessage = '';
    
    const email = this.loginForm.get('email')?.value;

    try {
      const { data, error } = await this.supabaseService.resendConfirmation(email);

      if (error) {
        this.errorMessage = "Error while sending mail : " + error.message;
      } else {
        this.isEmailNotConfirmed = false;
        this.resendMessage = "Confirmation email sent ! Check your inbox.";
      }
    } catch (err) {
      this.errorMessage = "An error occured while resending.";
    } finally {
      this.isResending = false;
      this.cdr.detectChanges();
    }
  }
}