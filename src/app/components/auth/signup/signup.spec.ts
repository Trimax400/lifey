import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SignupComponent } from './signup';
import { SupabaseService } from '../../../services/supabase';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  const mockSignUp = vi.fn();
  const mockSupabaseService = {
    signUp: mockSignUp
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: SupabaseService, useValue: mockSupabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    
    it('should be invalid if email is empty or incorrectly formatted', () => {
      component.signupForm.controls['email'].setValue('invalid-email');
      component.signupForm.controls['password'].setValue('password123');
      
      expect(component.signupForm.invalid).toBe(true);
      expect(component.signupForm.get('email')?.hasError('email')).toBe(true);
    });

    it('should be invalid if password is less than 6 characters', () => {
      component.signupForm.controls['email'].setValue('test@example.com');
      component.signupForm.controls['password'].setValue('12345');
      
      expect(component.signupForm.invalid).toBe(true);
      expect(component.signupForm.get('password')?.hasError('minlength')).toBe(true);
    });

    it('should be valid if email and password are correct', () => {
      component.signupForm.controls['email'].setValue('test@example.com');
      component.signupForm.controls['password'].setValue('password123');
      
      expect(component.signupForm.valid).toBe(true);
    });
  });

  describe('Signup Logic (onSubmit)', () => {
    
    it('should not call Supabase if the form is invalid', async () => {
      component.signupForm.controls['email'].setValue('invalid');
      
      await component.onSubmit();
      
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('should call Supabase, show success message, and reset form on success', async () => {
      component.signupForm.controls['email'].setValue('test@example.com');
      component.signupForm.controls['password'].setValue('password123');
      mockSignUp.mockResolvedValue({ data: {}, error: null });

      const promise = component.onSubmit();
      
      expect(component.isLoading()).toBe(true);

      await promise;

      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(component.successMessage()).toBe('Successfully registered ! Check your email box to confirm your email.');
      expect(component.errorMessage()).toBe('');
      expect(component.isLoading()).toBe(false);
      
      // Le formulaire doit avoir été réinitialisé
      expect(component.signupForm.value.email).toBeFalsy();
      expect(component.signupForm.value.password).toBeFalsy();
    });

    it('should display an error if Supabase returns an error', async () => {
      component.signupForm.controls['email'].setValue('test@example.com');
      component.signupForm.controls['password'].setValue('password123');
      const mockError = { message: 'User already exists' };
      mockSignUp.mockResolvedValue({ data: null, error: mockError });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('User already exists');
      expect(component.successMessage()).toBe('');
      expect(component.isLoading()).toBe(false);
    });

    it('should catch and display exceptions', async () => {
      component.signupForm.controls['email'].setValue('test@example.com');
      component.signupForm.controls['password'].setValue('password123');
      mockSignUp.mockRejectedValue(new Error('Network error'));

      await component.onSubmit();

      expect(component.errorMessage()).toBe('An unknown error occurred.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('HTML Template Rendering', () => {
    
    it('should disable the submit button and change text during loading', async () => {
      component.signupForm.controls['email'].setValue('test@example.com');
      component.signupForm.controls['password'].setValue('password123');
      component.isLoading.set(true);
      
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      
      const buttonEl = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      expect(buttonEl.disabled).toBe(true);
      expect(buttonEl.textContent.trim()).toBe('Creating an account...');
    });

    it('should display the error and success messages in the DOM', () => {
      component.errorMessage.set('Email already in use');
      component.successMessage.set('Account created!');
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.bg-red-50')).nativeElement.textContent.trim()).toBe('Email already in use');
      expect(fixture.debugElement.query(By.css('.bg-emerald-50')).nativeElement.textContent.trim()).toBe('Account created!');
    });
  });
});
