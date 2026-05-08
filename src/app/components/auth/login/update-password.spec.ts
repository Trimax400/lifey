import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { By } from '@angular/platform-browser';

import { UpdatePasswordComponent } from './update-password';
import { SupabaseService } from '../../../services/supabase';

describe('UpdatePasswordComponent', () => {
  let component: UpdatePasswordComponent;
  let fixture: ComponentFixture<UpdatePasswordComponent>;
  let mockUpdatePassword: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockUpdatePassword = vi.fn();
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UpdatePasswordComponent, ReactiveFormsModule],
      providers: [
        {
          provide: SupabaseService,
          useValue: { updatePassword: mockUpdatePassword }
        },
        {
          provide: Router,
          useValue: mockRouter
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form if passwords do not match', () => {
    component.updatePasswordForm.controls['password'].setValue('newpass123');
    component.updatePasswordForm.controls['confirmPassword'].setValue('differentpass');
    
    expect(component.updatePasswordForm.invalid).toBe(true);
    expect(component.updatePasswordForm.hasError('mismatch')).toBe(true);
  });

  it('should have a valid form if passwords match and are long enough', () => {
    component.updatePasswordForm.controls['password'].setValue('validpass');
    component.updatePasswordForm.controls['confirmPassword'].setValue('validpass');
    
    expect(component.updatePasswordForm.valid).toBe(true);
    expect(component.updatePasswordForm.hasError('mismatch')).toBe(false);
  });

  it('should have an invalid form if password is less than 6 characters', () => {
    component.updatePasswordForm.controls['password'].setValue('12345');
    component.updatePasswordForm.controls['confirmPassword'].setValue('12345');
    
    expect(component.updatePasswordForm.invalid).toBe(true);
    expect(component.updatePasswordForm.controls['password'].hasError('minlength')).toBe(true);
  });

  it('should not call update service if form is invalid', async () => {
    component.updatePasswordForm.controls['password'].setValue('short');
    component.updatePasswordForm.controls['confirmPassword'].setValue('short');
    
    await component.updatePassword();
    
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('should call updatePassword and navigate to login on success', fakeAsync(() => {
    mockUpdatePassword.mockResolvedValue({ error: null });
    
    component.updatePasswordForm.controls['password'].setValue('securepass');
    component.updatePasswordForm.controls['confirmPassword'].setValue('securepass');
    
    component.updatePassword();
    
    expect(component.isLoading).toBe(true);
    tick(); 
    
    expect(mockUpdatePassword).toHaveBeenCalledWith('securepass');
    expect(component.message).toBe('Your password has been successfully updated.');
    expect(component.isLoading).toBe(false);
    
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    tick(3000); 
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should display error message on update failure', fakeAsync(() => {
    mockUpdatePassword.mockResolvedValue({ error: { message: 'Weak password' } });
    
    component.updatePasswordForm.controls['password'].setValue('weakpass');
    component.updatePasswordForm.controls['confirmPassword'].setValue('weakpass');
    
    component.updatePassword();
    tick();
    
    expect(component.errorMessage).toBe('Weak password');
    expect(component.message).toBe('');
    expect(component.isLoading).toBe(false);
  }));

  it('should display mismatch error in the template when passwords differ', () => {
    component.updatePasswordForm.controls['password'].setValue('pass123');
    const confirmInput = component.updatePasswordForm.controls['confirmPassword'];
    confirmInput.setValue('pass456');
    confirmInput.markAsTouched(); 
    
    fixture.detectChanges();
    
    const errorDiv = fixture.debugElement.query(By.css('.text-red-500.text-xs'));
    expect(errorDiv.nativeElement.textContent).toContain('Passwords do not match.');
  });
});