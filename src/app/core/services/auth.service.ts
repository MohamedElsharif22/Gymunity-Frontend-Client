import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, finalize, catchError, of, timeout } from 'rxjs';
import { ApiService } from './api.service';
import {
  User,
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  AuthResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  SendResetPasswordLinkRequest,
  ResetPasswordRequest,
  UserRole
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly apiUrl = (environment as any).apiUrl;
  private readonly trainerUrl = (environment as any).trainerUrl;
  private readonly tokenKey = 'authToken';
  private readonly userKey = 'authUser';

  // Signals for state management (Angular best practice)
  private readonly currentUserSignal = signal<User | null>(this.getUserFromStorage());
  private readonly isAuthenticatedSignal = signal<boolean>(this.hasToken());
  private readonly loadingSignal = signal<boolean>(false);

  // Computed signals for derived state
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  readonly isLoading = computed(() => this.loadingSignal());

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/account/login`, credentials).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  register(formData: FormData): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/account/register`, formData).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  googleAuth(request: GoogleAuthRequest): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/account/google-auth`, request).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }

  updateProfile(formData: FormData): Observable<AuthResponse> {
    return this.apiService.postFormData<AuthResponse>(
      '/api/account/update-profile',
      formData
    ).pipe(
      tap(response => {
        if (response) {
          this.setAuthData(response);
        }
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.apiService.post<any>('/api/account/change-password', request);
  }

  sendResetPasswordLink(request: SendResetPasswordLinkRequest): Observable<any> {
    return this.apiService.post<any>('/api/account/send-reset-password-link', request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.apiService.post<any>('/api/account/reset-password', request);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  /**
   * Navigate user based on their role
   * Follows Angular routing best practices
   *
   * @param user - The authenticated user with role information
   * @param returnUrl - Optional return URL for clients
   */
  navigateByRole(user: User, returnUrl?: string): void {
    // Check if user is a trainer (handle both string and number formats from backend)
    const isTrainer = user.role === UserRole.Trainer;
    
    if (isTrainer) {
      // Navigate trainer to trainer app
      window.location.href = this.trainerUrl;
    } else {
      // Navigate client to dashboard
      const route = returnUrl || '/dashboard';
      this.router.navigateByUrl(route);
    }
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    // Sanitize profilePhotoUrl: avoid using the API root as an image URL
    const rawPhoto = response.profilePhotoUrl?.toString().trim();
    const apiRoot = this.apiUrl?.toString().replace(/\/+$/, '');
    const normalizedRaw = rawPhoto?.replace(/\/+$/, '');
    const profilePhotoUrl = (normalizedRaw && apiRoot && normalizedRaw !== apiRoot) ? rawPhoto : undefined;

    const user: User = {
      id: response.id,
      name: response.name,
      userName: response.userName,
      email: response.email,
      role: response.role,
      profilePhotoUrl: profilePhotoUrl
    };

    this.navigateByRole(user);
    
    console.log('setAuthData - User role from backend:', { role: response.role, enum_Trainer: UserRole.Trainer });
    
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Update the current user in the auth service
   * Used to sync profile changes (name, email, photo) with the auth state
   * 
   * @param user - Updated user object
   */
  updateCurrentUser(user: User | null): void {
    this.currentUserSignal.set(user);
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
  }

  /**
   * Update user profile information on the backend
   * Sends profile update to the backend with FormData
   * Falls back to local update if backend endpoint fails
   * 
   * @param fullName - User's full name
   * @param userName - User's username
   * @param email - User's email address
   * @param profilePhoto - Optional profile photo file
   * @returns Observable with updated user data
   */
  updateUserInfo(fullName: string, userName: string, email: string, profilePhoto?: File): Observable<any> {
    const formData = new FormData();
    formData.append('FullName', fullName);
    formData.append('UserName', userName);
    formData.append('Email', email);
    
    if (profilePhoto) {
      formData.append('ProfilePhoto', profilePhoto);
    }
    
    console.log('[AuthService] Updating user profile:', { fullName, userName, email, hasPhoto: !!profilePhoto });
    
    return this.apiService.put<any>('/api/account/update-profile', formData).pipe(
      timeout(5000),
      tap((response: any) => {
        console.log('[AuthService] Backend update successful:', response);
        // Update local state with response data from backend
        if (response) {
          const updatedUser = {
            id: response.id || this.getCurrentUser()?.id,
            name: response.name,
            email: response.email,
            userName: response.userName,
            profilePhotoUrl: response.profilePhotoUrl,
            role: response.role || this.getCurrentUser()?.role
          };
          this.updateCurrentUser(updatedUser);
          // Update token if new one provided
          if (response.token) {
            localStorage.setItem(this.tokenKey, response.token);
          }
          console.log('[AuthService] User info updated from backend:', updatedUser);
        }
      }),
      catchError(error => {
        console.warn('[AuthService] Backend update failed, updating locally:', error);
        // Even on error, update locally as fallback
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            name: fullName,
            email: email,
            userName: userName
          };
          this.updateCurrentUser(updatedUser);
          console.log('[AuthService] User info updated locally (fallback):', updatedUser);
        }
        // Return success to prevent error propagation
        return of({ success: true, fallback: true });
      })
    );
  }

  /**
   * Get current user's profile information
   * Returns the currently authenticated user
   * 
   * @returns Current user or null
   */
  getCurrentUserProfile(): User | null {
    return this.getCurrentUser();
  }

  /**
   * Update user name and username
   * Convenience method for updating user identity fields
   * 
   * @param fullName - User's full name
   * @param userName - User's username
   * @returns Observable with update result
   */
  updateUserIdentity(fullName: string, userName: string): Observable<any> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return of({ success: false, error: 'No authenticated user' });
    }

    return this.updateUserInfo(fullName, userName, currentUser.email);
  }

  /**
   * Update user email address
   * Convenience method for updating email field
   * 
   * @param email - New email address
   * @returns Observable with update result
   */
  updateUserEmail(email: string): Observable<any> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return of({ success: false, error: 'No authenticated user' });
    }

    return this.updateUserInfo(currentUser.name, currentUser.userName, email);
  }

  /**
   * Update user profile photo
   * Convenience method for updating profile photo
   * 
   * @param photoFile - Photo file to upload
   * @returns Observable with update result
   */
  updateProfilePhoto(photoFile: File): Observable<any> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return of({ success: false, error: 'No authenticated user' });
    }

    return this.updateUserInfo(currentUser.name, currentUser.userName, currentUser.email, photoFile);
  }
}

