import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdatePasswordComponent } from './update-password';
import { SupabaseService } from '../../../services/supabase';

describe('UpdatePasswordComponent', () => {
  let component: UpdatePasswordComponent;
  let fixture: ComponentFixture<UpdatePasswordComponent>;
  let mockRouter: any;

  const mockUpdatePassword = vi.fn();
  const mockSupabaseService = {
    updatePassword: mockUpdatePassword
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UpdatePasswordComponent],
      providers: [
        provideRouter([]),
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePasswordComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    
    it('should be invalid if password is less than 6 characters', () => {
      component.updatePasswordForm.controls['password'].setValue('12345');
      component.updatePasswordForm.controls['confirmPassword'].setValue('12345');
      
      expect(component.updatePasswordForm.invalid).toBe(true);
      expect(component.updatePasswordForm.get('password')?.hasError('minlength')).toBe(true);
    });

    it('should be invalid if passwords do not match', () => {
      component.updatePasswordForm.controls['password'].setValue('password123');
      component.updatePasswordForm.controls['confirmPassword'].setValue('different');
      
      expect(component.updatePasswordForm.invalid).toBe(true);
      expect(component.updatePasswordForm.hasError('mismatch')).toBe(true);
    });

    it('should be valid if passwords match and are at least 6 characters', () => {
      component.updatePasswordForm.controls['password'].setValue('password123');
      component.updatePasswordForm.controls['confirmPassword'].setValue('password123');
      
      expect(component.updatePasswordForm.valid).toBe(true);
      expect(component.updatePasswordForm.hasError('mismatch')).toBe(false);
    });
  });

  describe('Update Password Logic', () => {
    
    it('should not call Supabase if the form is invalid', async () => {
      component.updatePasswordForm.controls['password'].setValue('pass');
      
      await component.updatePassword();
      
      expect(mockUpdatePassword).not.toHaveBeenCalled();
    });

    it('should call Supabase, show success message, and navigate after 3s on success', async () => {
      vi.useFakeTimers();
      component.updatePasswordForm.controls['password'].setValue('password123');
      component.updatePasswordForm.controls['confirmPassword'].setValue('password123');
      mockUpdatePassword.mockResolvedValue({ error: null });

      const promise = component.updatePassword();
      
      expect(component.isLoading()).toBe(true);

      await promise; 

      expect(mockUpdatePassword).toHaveBeenCalledWith('password123');
      expect(component.message()).toBe('Your password has been successfully updated.');
      expect(component.errorMessage()).toBe('');
      expect(component.isLoading()).toBe(false);

      vi.advanceTimersByTime(3000);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      
      vi.useRealTimers();
    });

    it('should display an error if Supabase returns an error', async () => {
      component.updatePasswordForm.controls['password'].setValue('password123');
      component.updatePasswordForm.controls['confirmPassword'].setValue('password123');
      const mockError = { message: 'Token expired' };
      mockUpdatePassword.mockResolvedValue({ error: mockError });

      await component.updatePassword();

      expect(component.errorMessage()).toBe('Token expired');
      expect(component.message()).toBe('');
      expect(component.isLoading()).toBe(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should catch and display exceptions', async () => {
      component.updatePasswordForm.controls['password'].setValue('password123');
      component.updatePasswordForm.controls['confirmPassword'].setValue('password123');
      mockUpdatePassword.mockRejectedValue(new Error('Network error'));

      await component.updatePassword();

      expect(component.errorMessage()).toBe('Network error');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('HTML Template Rendering', () => {
    
    it('should disable the submit button and change text during loading', async () => {
      component.updatePasswordForm.controls['password'].setValue('password123');
      component.updatePasswordForm.controls['confirmPassword'].setValue('password123');
      component.isLoading.set(true);
      
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      
      const buttonEl = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      expect(buttonEl.disabled).toBe(true);
      expect(buttonEl.textContent.trim()).toBe('Updating...');
    });

    it('should display the error message in the DOM', () => {
      component.errorMessage.set('Passwords do not match');
      fixture.detectChanges();

      const errorDiv = fixture.debugElement.query(By.css('.bg-red-50 span')).nativeElement;
      expect(errorDiv.textContent.trim()).toBe('Passwords do not match');
    });

    it('should display the success message in the DOM', () => {
      component.message.set('Password successfully updated');
      fixture.detectChanges();

      const successDiv = fixture.debugElement.query(By.css('.bg-emerald-50')).nativeElement;
      expect(successDiv.textContent.trim()).toBe('Password successfully updated');
    });
  });
});