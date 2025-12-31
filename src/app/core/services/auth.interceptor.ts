import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

/**
 * Authentication Interceptor
 * Automatically adds Bearer token to all HTTP requests
 * Handles 401/403 errors appropriately
 * Angular 21+ functional interceptor pattern (HttpInterceptorFn)
 *
 * Features:
 * - Adds Authorization header with Bearer token
 * - Properly handles FormData requests (doesn't override Content-Type)
 * - Logs request/response for debugging
 * - Handles 401 Unauthorized by logging out user
 * - Handles 403 Forbidden for permission errors
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get token from AuthService
  const token = authService.getToken();

  // Clone request and add Authorization header if token exists
  if (token) {
    // For FormData requests, only add Authorization header (don't override Content-Type)
    // Browser will set Content-Type: multipart/form-data automatically
    if (request.body instanceof FormData) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      // For JSON requests, set both Authorization and Content-Type
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log(`[AuthInterceptor] Request with token:`, {
      method: request.method,
      url: request.url,
      hasAuth: !!token
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        console.error('[AuthInterceptor] 401 Unauthorized - Invalid or expired token');
        // Token is invalid or expired
        authService.logout();
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.routerState.root.component }
        });
      }

      // Handle 403 Forbidden errors
      if (error.status === 403) {
        console.error('[AuthInterceptor] 403 Forbidden - Insufficient permissions', error);
      }

      // Handle network errors
      if (error.status === 0) {
        console.error('[AuthInterceptor] Network error - Check if backend is running', error);
      }

      return throwError(() => error);
    })
  );
};
