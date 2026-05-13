import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageSwitcherComponent } from './language-switcher';
import { LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

describe('LanguageSwitcherComponent', () => {
  let component: LanguageSwitcherComponent;
  let fixture: ComponentFixture<LanguageSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LOCALE_ID, useValue: 'en-US' } // Langue injectée par défaut
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should identify the current language', () => {
    expect(component.currentLang).toBe('en');

    fixture.componentRef.setInput('localeOverride', 'fr-FR');
    
    expect(component.currentLang).toBe('fr');
  });

  it('should redirect when switching language', () => {
    vi.stubGlobal('location', { pathname: '/en/dashboard' });
    const redirectSpy = vi.spyOn(component as any, 'redirectTo').mockImplementation(() => {});

    component.switchLanguage('fr');
    
    expect(redirectSpy).toHaveBeenCalledWith('/fr/dashboard');
  });

  it('should not redirect if the language is already selected', () => {
    vi.stubGlobal('location', { pathname: '/en/dashboard' });
    const redirectSpy = vi.spyOn(component as any, 'redirectTo').mockImplementation(() => {});

    component.switchLanguage('en');
    
    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it('should handle root path or no prefix', () => {
    vi.stubGlobal('location', { pathname: '/dashboard' });
    const redirectSpy = vi.spyOn(component as any, 'redirectTo').mockImplementation(() => {});

    component.switchLanguage('fr');
    
    expect(redirectSpy).toHaveBeenCalledWith('/fr/dashboard');
  });
});