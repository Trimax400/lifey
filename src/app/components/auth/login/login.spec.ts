import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { LoginComponent } from './login';
import { SupabaseService } from '../../../services/supabase';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockSignIn: any;
  let mockResendConfirmation: any;
  let mockRouter: any;
  let fragmentSubject: BehaviorSubject<string | null>;

  beforeEach(async () => {
    mockSignIn = vi.fn();
    mockResendConfirmation = vi.fn();
    mockRouter = { navigateByUrl: vi.fn() };
    fragmentSubject = new BehaviorSubject<string | null>(null);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        {
          provide: SupabaseService,
          useValue: { signIn: mockSignIn, resendConfirmation: mockResendConfirmation }
        },
        {
          provide: Router,
          useValue: mockRouter
        },
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
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display success message if URL fragment is type=signup', () => {
    fragmentSubject.next('type=signup');
    fixture.detectChanges();

    expect(component.successMessage).toBe("Email confirmed. You can now log in.");
  });

  it('should not submit if form is invalid', async () => {
    component.loginForm.controls['email'].setValue('');
    component.loginForm.controls['password'].setValue('');
    
    await component.onSubmit();
    
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('should call signIn and navigate to returnUrl on success', fakeAsync(() => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.queryParams = { returnUrl: '/custom-dashboard' };
    
    mockSignIn.mockResolvedValue({ error: null });
    
    component.loginForm.controls['email'].setValue('john@doe.com');
    component.loginForm.controls['password'].setValue('azerty123');
    
    component.onSubmit();
    tick();
    
    expect(mockSignIn).toHaveBeenCalledWith('john@doe.com', 'azerty123');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/custom-dashboard');
  }));

  it('should navigate to /dashboard by default on success', fakeAsync(() => {
    mockSignIn.mockResolvedValue({ error: null });
    
    component.loginForm.controls['email'].setValue('john@doe.com');
    component.loginForm.controls['password'].setValue('azerty123');
    
    component.onSubmit();
    tick();
    
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  }));

  it('should display error message on login failure', fakeAsync(() => {
    mockSignIn.mockResolvedValue({ error: { message: 'Wrong credentials' } });
    
    component.loginForm.controls['email'].setValue('john@doe.com');
    component.loginForm.controls['password'].setValue('wrongpass');
    
    component.onSubmit();
    tick();
    
    expect(component.errorMessage).toBe('Wrong credentials');
    expect(component.isEmailNotConfirmed).toBe(false);
  }));

  it('should detect unconfirmed email and update state', fakeAsync(() => {
    mockSignIn.mockResolvedValue({ error: { message: 'Email not confirmed' } });
    
    component.loginForm.controls['email'].setValue('john@doe.com');
    component.loginForm.controls['password'].setValue('azerty123');
    
    component.onSubmit();
    tick();
    
    expect(component.isEmailNotConfirmed).toBe(true);
    expect(component.errorMessage).toBe("Your email is not confirmed yet. Check your inbox.");
  }));

  it('should successfully resend confirmation email', fakeAsync(() => {
    mockResendConfirmation.mockResolvedValue({ data: {}, error: null });
    component.loginForm.controls['email'].setValue('john@doe.com');
    
    component.onResendConfirmation();
    tick();
    
    expect(mockResendConfirmation).toHaveBeenCalledWith('john@doe.com');
    expect(component.isEmailNotConfirmed).toBe(false);
    expect(component.resendMessage).toBe("Confirmation email sent ! Check your inbox.");
  }));

  it('should display error if resend confirmation fails', fakeAsync(() => {
    mockResendConfirmation.mockResolvedValue({ error: { message: 'Server down' } });
    component.loginForm.controls['email'].setValue('john@doe.com');
    
    component.onResendConfirmation();
    tick();
    
    expect(component.errorMessage).toBe("Error while sending mail : Server down");
  }));
});