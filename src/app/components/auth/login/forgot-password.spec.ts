import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForgotPasswordComponent } from './forgot-password';
import { SupabaseService } from '../../../services/supabase';
import { environment } from '../../../../environments/environment';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  
  const mockResetPasswordForEmail = vi.fn();
  const mockSupabaseService = {
    resetPasswordForEmail: mockResetPasswordForEmail
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: SupabaseService, useValue: mockSupabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Reset Password Logic', () => {
    
    it('should show an error if the email is empty', async () => {
      component.email.set('');
      
      await component.resetPassword();
      
      expect(component.errorMessage()).toBe('Put your email address.');
      expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
    });

    it('should call Supabase and show a success message', async () => {
      component.email.set('john.doe@example.com');
      mockResetPasswordForEmail.mockResolvedValue({ error: null });

      await component.resetPassword();

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('john.doe@example.com', {
        redirectTo: `${environment.serverUrl}/update-password`
      });
      expect(component.message()).toBe('A password reset link has been sent to your email address.');
      expect(component.errorMessage()).toBe('');
      expect(component.isLoading()).toBe(false);
    });

    it('should display an error if Supabase returns an error', async () => {
      component.email.set('john.doe@example.com');
      const mockError = { message: 'User not found' };
      mockResetPasswordForEmail.mockResolvedValue({ error: mockError });

      await component.resetPassword();

      expect(component.errorMessage()).toBe('User not found');
      expect(component.message()).toBe('');
      expect(component.isLoading()).toBe(false);
    });

    it('should catch and display exceptions', async () => {
      component.email.set('john.doe@example.com');
      mockResetPasswordForEmail.mockRejectedValue(new Error('Network error'));

      await component.resetPassword();

      expect(component.errorMessage()).toBe('Network error');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('HTML Template Rendering', () => {
    
    it('should disable the submit button during loading and change its text', async () => {
      component.email.set('john.doe@example.com');
      component.isLoading.set(true);
      
      fixture.detectChanges();
      
      await fixture.whenStable(); 
      
      fixture.detectChanges(); 
      
      const buttonEl = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      
      expect(buttonEl.disabled).toBe(true);
      expect(buttonEl.textContent.trim()).toBe('Email sent');
    });

    it('should display the error message in the DOM', async () => {
      component.errorMessage.set('Invalid email');
      
      fixture.detectChanges();

      const errorDiv = fixture.debugElement.query(By.css('.text-red-600')).nativeElement;
      expect(errorDiv.textContent.trim()).toBe('Invalid email');
    });

    it('should display the success message in the DOM', async () => {
      component.message.set('Check your inbox');
      
      fixture.detectChanges();

      const successDiv = fixture.debugElement.query(By.css('.text-emerald-700')).nativeElement;
      expect(successDiv.textContent.trim()).toBe('Check your inbox');
    });
  });
});