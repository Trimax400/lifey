import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Profile } from './profile';
import { SupabaseService } from '../../../services/supabase';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  const mockGetUser = vi.fn();
  const mockUpdatePassword = vi.fn();

  const mockSupabaseService = {
    supabase: {
      auth: {
        getUser: mockGetUser
      }
    },
    updatePassword: mockUpdatePassword
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockGetUser.mockResolvedValue({ 
      data: { user: { email: 'user@example.com', created_at: '2024-01-01T12:00:00Z' } }, 
      error: null 
    });

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        { provide: SupabaseService, useValue: mockSupabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization & Loading', () => {
    it('should create the component and load user data on init', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      expect(component).toBeTruthy();
      expect(mockGetUser).toHaveBeenCalled();
      expect(component.userEmail()).toBe('user@example.com');
      expect(component.createdAt()).toBe('2024-01-01T12:00:00Z');
      expect(component.isLoading()).toBe(false);
    });

    it('should handle error when getting user data', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Auth error' } });
      
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      expect(component.errorMessage()).toBe('Auth error');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Update Password Logic', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();
    });

    it('should show error if password is less than 6 characters', async () => {
      component.newPassword.set('123');
      component.confirmPassword.set('123');

      await component.onUpdatePassword();

      expect(mockUpdatePassword).not.toHaveBeenCalled();
      expect(component.errorMessage()).toBe('The password must be at least 6 characters long.');
    });

    it('should show error if passwords do not match', async () => {
      component.newPassword.set('password123');
      component.confirmPassword.set('different123');

      await component.onUpdatePassword();

      expect(mockUpdatePassword).not.toHaveBeenCalled();
      expect(component.errorMessage()).toBe('Passwords do not match.');
    });

    it('should update password successfully and reset fields', async () => {
      component.newPassword.set('newpassword123');
      component.confirmPassword.set('newpassword123');
      mockUpdatePassword.mockResolvedValue({ error: null });

      const promise = component.onUpdatePassword();
      expect(component.isUpdating()).toBe(true);

      await promise;

      expect(mockUpdatePassword).toHaveBeenCalledWith('newpassword123');
      expect(component.successMessage()).toBe('Your password has been updated successfully.');
      expect(component.newPassword()).toBe('');
      expect(component.confirmPassword()).toBe('');
      expect(component.isUpdating()).toBe(false);
    });
  });

  describe('HTML Template Rendering', () => {
    it('should display the loading spinner initially', () => {
      component.isLoading.set(true);
      fixture.detectChanges();
      
      const spinner = fixture.debugElement.query(By.css('.animate-spin'));
      expect(spinner).toBeTruthy();
    });

    it('should render the user email and hide spinner after loading', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.animate-spin'));
      const emailDiv = fixture.debugElement.query(By.css('.truncate')).nativeElement;

      expect(spinner).toBeFalsy();
      expect(emailDiv.textContent.trim()).toBe('user@example.com');
    });
  });
});
