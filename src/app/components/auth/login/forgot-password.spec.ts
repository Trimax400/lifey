import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormsModule } from '@angular/forms';

import { ForgotPasswordComponent } from './forgot-password';
import { SupabaseService } from '../../../services/supabase';
import { environment } from '../../../../environments/environment';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let mockResetPasswordForEmail: any;

  beforeEach(async () => {
    mockResetPasswordForEmail = vi.fn();
    
    const mockSupabaseService = {
      resetPasswordForEmail: mockResetPasswordForEmail
    };

    await TestBed.configureTestingModule({
      imports: [
        ForgotPasswordComponent,
        FormsModule
      ],
      providers: [
        { provide: SupabaseService, useValue: mockSupabaseService },
        provideRouter([]) 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges(); 
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show a message if email is empty', async () => {
    component.email = '';
    await component.resetPassword();

    expect(component.errorMessage).toBe('Put your email address.');
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('should call supabase and show a message on success', fakeAsync(() => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    component.email = 'test@example.com';
    
    component.resetPassword();

    expect(component.isLoading).toBe(true);

    tick();

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
      redirectTo: `${environment.serverUrl}/update-password`,
    });
    expect(component.message).toBe('A password reset link has been sent to your email address.');
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBe(false);
  }));

  it('should display Supabase error on failure', fakeAsync(() => {
    const supabaseError = { message: 'Too many requests' };
    mockResetPasswordForEmail.mockResolvedValue({ error: supabaseError });

    component.email = 'fail@example.com';
    component.resetPassword();

    tick();

    expect(component.errorMessage).toBe('Too many requests');
    expect(component.message).toBe('');
    expect(component.isLoading).toBe(false);
  }));

  it('should disable the submit button if the form is invalid or loading', async () => {
    const buttonElement = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;

    fixture.detectChanges(); 
    await fixture.whenStable(); 
    
    expect(buttonElement.disabled).toBe(true);

    component.email = 'valid@email.com';
    component.isLoading = true;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.disabled).toBe(true);
  });
});