import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, RegisterRequest, AuthResponse, UpdateProfileRequest, ChangePasswordRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = (environment as any).apiUrl;
  private tokenKey = 'authToken';
  private userKey = 'authUser';

  currentUser$ = new BehaviorSubject<User | null>(this.getUserFromStorage());
  isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/account/login`, credentials).pipe(
      tap(response => this.setAuthData(response))
    );
  }

  register(data: FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/account/register`, data).pipe(
      tap(response => this.setAuthData(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  updateProfile(data: FormData): Observable<any> {
    return this.apiService.postFormData('/api/Account/update-profile', data);
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.apiService.post('/api/Account/change-password', request);
  }

  getCurrentUser(): User | null {
    return this.currentUser$.getValue();
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUser$.next(response.user);
    this.isAuthenticated$.next(true);
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }
}
