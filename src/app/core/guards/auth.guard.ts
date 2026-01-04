import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[AuthGuard] Checking authentication for route:', state.url);
  
  if (authService.hasToken()) {
    console.log('[AuthGuard] ✅ User has token, allowing access');
    return true;
  }

  console.log('[AuthGuard] ❌ No token found, redirecting to login');
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const noAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasToken()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
