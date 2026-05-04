import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
//import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { SupabaseService } from './services/supabase';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), /*provideClientHydration(withEventReplay()),*/
    provideAppInitializer(() => {
      const supabaseService = inject(SupabaseService);
      return supabaseService.supabase.auth.getSession();
    }),
  ]
};
