import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
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
  ResetPasswordRequest
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);
  private readonly apiUrl = (environment as any).apiUrl;
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
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }
}

