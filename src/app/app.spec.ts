import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from './app';
import { SupabaseService } from './services/supabase';

describe('AppComponent', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  const mockSupabaseService = {
    signOut: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: SupabaseService, useValue: mockSupabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('Mobile Menu Logic', () => {
    const createTouchEvent = (clientX: number, clientY: number) => {
      return {
        changedTouches: [{ clientX, clientY }]
      } as unknown as TouchEvent;
    };

    it('should toggle the mobile menu state', () => {
      expect(component.isMobileMenuOpen()).toBe(false);
      
      component.isMobileMenuOpen.set(true);
      expect(component.isMobileMenuOpen()).toBe(true);

      component.closeMobileMenu();
      expect(component.isMobileMenuOpen()).toBe(false);
    });

    it('should open mobile menu on right swipe from the left edge', () => {
      component.onTouchStart(createTouchEvent(50, 100));
      component.onTouchEnd(createTouchEvent(150, 100));

      expect(component.isMobileMenuOpen()).toBe(true);
    });

    it('should close mobile menu on left swipe', () => {
      component.isMobileMenuOpen.set(true);

      component.onTouchStart(createTouchEvent(200, 100));
      component.onTouchEnd(createTouchEvent(100, 100));

      expect(component.isMobileMenuOpen()).toBe(false);
    });
  });

  describe('HTML Template Rendering', () => {
    it('should apply correct classes to sidebar when menu is open or closed', () => {
      let sidebarEl = fixture.debugElement.query(By.css('app-sidebar')).nativeElement;
      expect(sidebarEl.classList.contains('-translate-x-full')).toBe(true);

      component.isMobileMenuOpen.set(true);
      fixture.detectChanges();

      expect(sidebarEl.classList.contains('translate-x-0')).toBe(true);
      expect(sidebarEl.classList.contains('-translate-x-full')).toBe(false);
    });

    it('should render the backdrop only when the menu is open', () => {
      expect(fixture.debugElement.query(By.css('.backdrop-blur-sm'))).toBeNull();

      component.isMobileMenuOpen.set(true);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.backdrop-blur-sm'))).toBeTruthy();
    });
  });
});
