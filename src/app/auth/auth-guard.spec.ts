import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { authGuard } from './auth-guard';
import { SupabaseService } from '../services/supabase';


@Component({ template: '<h1>Login Page</h1>', standalone: true })
class LoginComponent { }

@Component({ template: '<h1>Protected Page</h1>', standalone: true })
class ProtectedComponent { }

describe('authGuard', () => {
  let harness: RouterTestingHarness;
  let mockGetSession: any;
  let router: Router;

  beforeEach(async () => {
    mockGetSession = vi.fn();
    const mockSupabaseService = {
      supabase: {
        auth: {
          getSession: mockGetSession,
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: SupabaseService, useValue: mockSupabaseService },
        provideRouter([

          { path: 'protected', component: ProtectedComponent, canActivate: [authGuard] },
          { path: 'login', component: LoginComponent },
        ]),
      ],
    });

    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  it('devrait autoriser l\'accès à la route si une session est active', async () => {

    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'xyz' } } });

    await harness.navigateByUrl('/protected', ProtectedComponent);

    expect(harness.routeNativeElement?.textContent).toContain('Protected Page');
    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });

  it('devrait rediriger vers /login avec returnUrl si aucune session n\'est active', async () => {

    mockGetSession.mockResolvedValue({ data: { session: null } });

    await harness.navigateByUrl('/protected', LoginComponent);

    expect(harness.routeNativeElement?.textContent).toContain('Login Page');
    expect(mockGetSession).toHaveBeenCalledTimes(1);

    expect(router.url).toBe('/login?returnUrl=%2Fprotected');
  });
});