import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Subject } from 'rxjs';
import { LoginComponent } from './login';
import { SupabaseService } from '../../../services/supabase';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter: any;
  let fragmentSubject: Subject<string | null>;

  const mockSignIn = vi.fn();
  const mockResendConfirmation = vi.fn();
  const mockSupabaseService = {
    signIn: mockSignIn,
    resendConfirmation: mockResendConfirmation
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockRouter = {
      navigateByUrl: vi.fn()
    };

    fragmentSubject = new Subject<string | null>();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: fragmentSubject.asObservable(),
            snapshot: { queryParams: {} }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization (ngOnInit)', () => {
    
    it('should set successMessage if fragment contains type=signup', () => {
      fixture.detectChanges();
      fragmentSubject.next('type=signup');
      expect(component.successMessage()).toBe('Email confirmed. You can now log in.');
    });
  });

  describe('Login Logic (onSubmit)', () => {
    
    it('should not call signIn if the form is invalid', async () => {
      component.loginForm.controls['email'].setValue('invalid-email');
      component.loginForm.controls['password'].setValue('');
      
      await component.onSubmit();
      
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('should call Supabase signIn and navigate to dashboard on success', async () => {
      component.loginForm.controls['email'].setValue('john.doe@example.com');
      component.loginForm.controls['password'].setValue('password123');
      mockSignIn.mockResolvedValue({ error: null });

      await component.onSubmit();

      expect(mockSignIn).toHaveBeenCalledWith('john.doe@example.com', 'password123');
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
      expect(component.isLoading()).toBe(false);
    });

    it('should navigate to returnUrl if provided on successful login', async () => {
      component.loginForm.controls['email'].setValue('john.doe@example.com');
      component.loginForm.controls['password'].setValue('password123');
      
      const activatedRoute = TestBed.inject(ActivatedRoute);
      activatedRoute.snapshot.queryParams = { returnUrl: '/admin' };
      
      mockSignIn.mockResolvedValue({ error: null });

      await component.onSubmit();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/admin');
    });

    it('should display an error message if Supabase returns an error', async () => {
      component.loginForm.controls['email'].setValue('john.doe@example.com');
      component.loginForm.controls['password'].setValue('password123');
      mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('Invalid credentials');
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });

    it('should show email confirmation UI if login returns email_not_confirmed', async () => {
      component.loginForm.controls['email'].setValue('john.doe@example.com');
      component.loginForm.controls['password'].setValue('password123');
      mockSignIn.mockResolvedValue({ error: { message: 'Email not confirmed', code: 'email_not_confirmed' } });

      await component.onSubmit();

      expect(component.isEmailNotConfirmed()).toBe(true);
      expect(component.errorMessage()).toBe('Your email is not confirmed yet. Check your inbox.');
    });

    it('should catch and display exceptions', async () => {
      component.loginForm.controls['email'].setValue('john.doe@example.com');
      component.loginForm.controls['password'].setValue('password123');
      mockSignIn.mockRejectedValue({ error: { message: 'Network error' } });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('Network error');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Resend Confirmation Logic', () => {
    
    it('should call resendConfirmation and show success message', async () => {
      component.loginForm.controls['email'].setValue('john.doe@example.com');
      mockResendConfirmation.mockResolvedValue({ data: {}, error: null });

      await component.onResendConfirmation();

      expect(mockResendConfirmation).toHaveBeenCalledWith('john.doe@example.com');
      expect(component.resendMessage()).toBe('Confirmation email sent ! Check your inbox.');
      expect(component.isEmailNotConfirmed()).toBe(false);
      expect(component.isResending()).toBe(false);
    });

    it('should display an error if resendConfirmation fails', async () => {
      component.loginForm.controls['email'].setValue('john.doe@example.com');
      mockResendConfirmation.mockResolvedValue({ error: { message: 'Failed to send' } });

      await component.onResendConfirmation();

      expect(component.errorMessage()).toBe('Error while sending mail : Failed to send');
      expect(component.isResending()).toBe(false);
    });
  });

  describe('HTML Template Rendering', () => {
    
    it('should disable the submit button when the form is invalid', async () => {
      component.loginForm.controls['email'].setValue('');
      component.loginForm.controls['password'].setValue('');
      
      fixture.detectChanges();
      await fixture.whenStable();
      
      const buttonEl = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      expect(buttonEl.disabled).toBe(true);
    });

    it('should disable the submit button and change text during loading', async () => {
      component.loginForm.controls['email'].setValue('john.doe@example.com');
      component.loginForm.controls['password'].setValue('password123');
      component.isLoading.set(true);
      
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      
      const buttonEl = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      expect(buttonEl.disabled).toBe(true);
      expect(buttonEl.textContent.trim()).toBe('Connecting...');
    });

    it('should display the general error message in the DOM', async () => {
      component.errorMessage.set('Wrong credentials');
      
      fixture.detectChanges();

      const errorDiv = fixture.debugElement.query(By.css('.text-red-500 span')).nativeElement;
      expect(errorDiv.textContent.trim()).toBe('Wrong credentials');
    });

    it('should display the resend confirmation button when isEmailNotConfirmed is true', async () => {
      component.errorMessage.set('Not confirmed');
      component.isEmailNotConfirmed.set(true);
      
      fixture.detectChanges();

      const resendButtonEl = fixture.debugElement.query(By.css('button[type="button"]')).nativeElement;
      expect(resendButtonEl.textContent.trim()).toBe('Resend confirmation email.');
    });
  });
});