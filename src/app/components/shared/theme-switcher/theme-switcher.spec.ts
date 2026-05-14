import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeSwitcherComponent } from './theme-switcher';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DOCUMENT } from '@angular/common';

describe('ThemeSwitcherComponent', () => {
  let component: ThemeSwitcherComponent;
  let fixture: ComponentFixture<ThemeSwitcherComponent>;
  let document: Document;

  beforeEach(async () => {
    // Mock localStorage
    const localStorageMock = (() => {
      let store: { [key: string]: string } = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        clear: () => { store = {}; }
      };
    })();
    vi.stubGlobal('localStorage', localStorageMock);

    // Mock matchMedia
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    await TestBed.configureTestingModule({
      imports: [ThemeSwitcherComponent],
      providers: [
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    document = TestBed.inject(DOCUMENT);
    fixture = TestBed.createComponent(ThemeSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.documentElement.classList.remove('dark');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with system theme by default', () => {
    expect(component.activeTheme()).toBe('system');
  });

  it('should initialize from localStorage', async () => {
    localStorage.setItem('theme', 'dark');
    
    // Re-create component to trigger constructor logic
    fixture = TestBed.createComponent(ThemeSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component.activeTheme()).toBe('dark');
  });

  it('should change theme and update localStorage', () => {
    const setItemSpy = vi.spyOn(localStorage, 'setItem');
    
    component.setTheme('light');
    fixture.detectChanges();

    expect(component.activeTheme()).toBe('light');
    expect(setItemSpy).toHaveBeenCalledWith('theme', 'light');
  });

  it('should apply "dark" class when theme is dark', () => {
    component.setTheme('dark');
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove "dark" class when theme is light', () => {
    document.documentElement.classList.add('dark');
    
    component.setTheme('light');
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should handle system dark mode preference', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    // Re-create component to pick up the new matchMedia mock during initialization/effect
    fixture = TestBed.createComponent(ThemeSwitcherComponent);
    component = fixture.componentInstance;
    component.setTheme('system');
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
