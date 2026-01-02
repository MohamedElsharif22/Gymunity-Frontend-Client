import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ClientProfileService } from '../services/client-profile.service';
import { inject } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Profile Completion Guard
 * Ensures client profile is complete before accessing protected features
 * Redirects to profile completion if profile is not found
 */
export const profileCompletionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const profileService = inject(ClientProfileService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!authService.hasToken()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Then check if profile exists and is complete
  return profileService.getProfile().pipe(
    map(profile => {
      // Check if profile has required fields (userName is the only required field)
      if (profile && profile.userName) {
        return true;
      }

      // If profile is incomplete, redirect to profile page
      router.navigate(['/profile'], { queryParams: { returnUrl: state.url } });
      return false;
    }),
    catchError(() => {
      // If profile doesn't exist or error occurs, redirect to profile page
      router.navigate(['/profile'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );
};
