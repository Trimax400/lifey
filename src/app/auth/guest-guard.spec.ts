import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { guestGuard } from './guest-guard';
import { SupabaseService } from '../services/supabase';

@Component({selector: 'test-login', template: '<h1>Login Page</h1>', standalone: true })
class LoginComponent {}

@Component({ template: '<h1>Dashboard Page</h1>', standalone: true })
class DashboardComponent {}

describe('guestGuard', () => {
  let harness: RouterTestingHarness;
  let mockGetUser: any;

  beforeEach(async () => {
    mockGetUser = vi.fn();
    const mockSupabaseService = {
      supabase: {
        auth: {
          getUser: mockGetUser,
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: SupabaseService, useValue: mockSupabaseService },
        
        provideRouter([
          { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
          { path: 'dashboard', component: DashboardComponent },
        ]),
      ],
    });

    harness = await RouterTestingHarness.create();
  });

  it('should autorize navigation to /login if no user is logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await harness.navigateByUrl('/login', LoginComponent);

    expect(harness.routeNativeElement?.textContent).toContain('Login Page');
    expect(mockGetUser).toHaveBeenCalledTimes(1);
  });

  it('should redirect to /dashboard if a user is logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } } });

    await harness.navigateByUrl('/login', DashboardComponent);

    expect(harness.routeNativeElement?.textContent).toContain('Dashboard Page');
    expect(mockGetUser).toHaveBeenCalledTimes(1);
  });
});