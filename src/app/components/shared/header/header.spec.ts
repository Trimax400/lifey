import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeaderComponent } from './header';
import { SupabaseService } from '../../../services/supabase';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;

  const mockSignOut = vi.fn();
  const mockSupabaseService = {
    signOut: mockSignOut
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: SupabaseService, useValue: mockSupabaseService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('HTML Template Rendering', () => {
    it('should display the navigation links', () => {
      const links = fixture.debugElement.queryAll(By.css('ul li a'));
      expect(links.length).toBe(2);
      expect(links[0].nativeElement.textContent.trim()).toBe('transactions');
      expect(links[0].nativeElement.getAttribute('href')).toBe('/transactions');
      expect(links[1].nativeElement.textContent.trim()).toBe('dashboard');
      expect(links[1].nativeElement.getAttribute('href')).toBe('/dashboard');
    });
  });

  describe('Logout Logic', () => {
    it('should call Supabase signOut and navigate to /login on success', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      await component.logout();

      expect(mockSignOut).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should log an error to the console if signOut throws an exception', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Network error');
      mockSignOut.mockRejectedValue(mockError);

      await component.logout();

      expect(consoleSpy).toHaveBeenCalledWith('Erreur inattendue lors de la déconnexion:', mockError);
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
