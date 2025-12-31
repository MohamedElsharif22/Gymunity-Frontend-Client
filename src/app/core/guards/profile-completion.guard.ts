import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ClientProfileService } from '../../features/profile/services/client-profile.service';
import { inject } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard to enforce profile completion
 * Redirects to profile page if onboarding is not completed
 * Allows access to protected routes only if profile is complete
 */
export const profileCompletionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const profileService = inject(ClientProfileService);
  const router = inject(Router);

  // Allow access to profile route regardless of completion status
  if (state.url.includes('/profile')) {
    return true;
  }

  // Check if onboarding is completed
  return profileService.checkOnboardingStatus().pipe(
    map(isCompleted => {
      if (isCompleted) {
        return true; // Allow access if profile is complete
      } else {
        // Redirect to profile completion page
        router.navigate(['/profile'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    }),
    catchError(() => {
      // If check fails, redirect to profile as a precaution
      router.navigate(['/profile']);
      return of(false);
    })
  );
};
