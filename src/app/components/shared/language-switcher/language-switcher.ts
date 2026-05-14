import { Component, inject, LOCALE_ID, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html'
})
export class LanguageSwitcherComponent {
  private injectedLocale = inject(LOCALE_ID);
  
  localeOverride = input<string>();

  languages = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'fr', label: 'FR', name: 'Français' }
  ];

  get currentLocale() {
    return this.localeOverride() || this.injectedLocale || 'en-US';
  }

  get currentLang() {
    return this.currentLocale.split('-')[0];
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.switchLanguage(select.value);
  }

  switchLanguage(code: string) {
    if (this.currentLang === code) return;

    const currentPath = window.location.pathname;
    const langPrefixes = ['/en', '/fr'];
    
    let newPath = currentPath;
    let foundPrefix = false;
    for (const prefix of langPrefixes) {
      if (currentPath.startsWith(prefix + '/') || currentPath === prefix) {
        newPath = currentPath.replace(prefix, `/${code}`);
        foundPrefix = true;
        break;
      }
    }

    if (!foundPrefix) {
      newPath = currentPath === '/' ? `/${code}` : `/${code}${currentPath}`;
    }

    this.redirectTo(newPath);
  }

  protected redirectTo(url: string) {
    window.location.href = url;
  }
}
