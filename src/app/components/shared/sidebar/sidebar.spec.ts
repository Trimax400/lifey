import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SidebarComponent } from './sidebar';
import { SupabaseService } from '../../../services/supabase';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let router: Router;

  const mockSignOut = vi.fn();
  const mockSupabaseService = {
    signOut: mockSignOut
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        { provide: SupabaseService, useValue: mockSupabaseService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('HTML Template Rendering', () => {
    it('should display the navigation categories and links', () => {
      const categoryHeaders = fixture.debugElement.queryAll(By.css('h3'));
      expect(categoryHeaders.length).toBe(2);
      expect(categoryHeaders[0].nativeElement.textContent.trim()).toBe('Main');
      expect(categoryHeaders[1].nativeElement.textContent.trim()).toBe('Settings');

      const links = fixture.debugElement.queryAll(By.css('nav a'));
      expect(links.length).toBe(3);
      
      expect(links[0].nativeElement.textContent.trim()).toBe('dashboard');
      expect(links[0].nativeElement.getAttribute('href')).toBe('/dashboard');
      
      expect(links[1].nativeElement.textContent.trim()).toBe('transactions');
      expect(links[1].nativeElement.getAttribute('href')).toBe('/transactions');
      
      expect(links[2].nativeElement.textContent.trim()).toBe('profile');
      expect(links[2].nativeElement.getAttribute('href')).toBe('/profile');
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
