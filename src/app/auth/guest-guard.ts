import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase';

export const guestGuard: CanActivateFn = async (route, state) => {
  const supabase = inject(SupabaseService).supabase;
  const router = inject(Router);

  const { data } = await supabase.auth.getUser();

  if (data.user) {
    return router.createUrlTree(['/dashboard']);
  } else {
    return true;
  }
};