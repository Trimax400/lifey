import { Component, Inject, signal, effect } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { LucideAngularModule, Monitor, Sun, Moon } from 'lucide-angular';

type Theme = 'system' | 'light' | 'dark';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './theme-switcher.html'
})
export class ThemeSwitcherComponent {
  activeTheme = signal<Theme>('system');

  readonly modes = [
    { id: 'system' as Theme, icon: Monitor, label: 'System' },
    { id: 'light' as Theme, icon: Sun, label: 'Light' },
    { id: 'dark' as Theme, icon: Moon, label: 'Dark' },
  ];

  constructor(@Inject(DOCUMENT) private document: Document) {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      this.activeTheme.set(storedTheme);
    }

    effect(() => {
      const theme = this.activeTheme();
      
      localStorage.setItem('theme', theme);
      
      this.applyThemeLogic(theme);
    });
  }

  setTheme(theme: Theme) {
    this.activeTheme.set(theme);
  }

  private applyThemeLogic(theme: Theme) {
    const isDark = 
      theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      this.document.documentElement.classList.add('dark');
    } else {
      this.document.documentElement.classList.remove('dark');
    }
  }
}