import { Component, inject, signal, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';
import { LoginRequest, GoogleAuthRequest, UserRole } from '../../../../core/models';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-linear-to-br from-sky-600 via-sky-700 to-blue-800 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        <!-- Left Side - Branding & Benefits -->
        <div class="hidden lg:flex flex-col justify-center text-white space-y-8 px-8">
          <div class="animate-fade-in">
            <div class="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white border-opacity-30">
              <span class="text-sky-500 font-bold text-3xl">G</span>
            </div>
            <h1 class="text-5xl font-bold mb-3">Gymunity</h1>
            <p class="text-xl text-sky-100">Your Fitness Journey Starts Here</p>
          </div>

          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-md border border-white border-opacity-20">
                <app-icon name="zap" size="24" color="sky"></app-icon>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-1">Transform Your Body</h3>
                <p class="text-sky-100">Achieve your fitness goals with expert guidance</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-md border border-white border-opacity-20">
                <app-icon name="users" size="24" color="sky"></app-icon>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-1">Connect With Community</h3>
                <p class="text-sky-100">Join thousands of fitness enthusiasts</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-md border border-white border-opacity-20">
                <app-icon name="award" size="24" color="sky"></app-icon>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-1">Track Your Progress</h3>
                <p class="text-sky-100">Monitor workouts and celebrate milestones</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="w-full">
          <div class="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
            <!-- Mobile Branding -->
            <div class="lg:hidden text-center mb-8">
              <div class="w-14 h-14 bg-sky-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span class="text-white font-bold text-2xl">G</span>
              </div>
              <h1 class="text-2xl font-bold text-gray-900">Gymunity</h1>
              <p class="text-gray-500 text-sm mt-1">Sign in to continue</p>
            </div>

            <!-- Form Header -->
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p class="text-gray-600">Sign in to your account to get started</p>
            </div>

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
              <!-- Email -->
              <div class="group">
                <label class="block text-sm font-semibold text-gray-900 mb-2 transition">Email Address</label>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="your@email.com"
                  class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition duration-300 bg-gray-50 hover:bg-white"
                />
                <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <app-icon name="alert" size="16" color="red"></app-icon>
                  Please enter a valid email address
                </p>
              </div>

              <!-- Password -->
              <div class="group">
                <label class="block text-sm font-semibold text-gray-900 mb-2 transition">Password</label>
                <input
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition duration-300 bg-gray-50 hover:bg-white"
                />
                <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <app-icon name="alert" size="16" color="red"></app-icon>
                  Password is required
                </p>
              </div>

              <!-- Remember Me & Forgot Password -->
              <div class="flex items-center justify-between pt-2">
                <label class="flex items-center gap-2 cursor-pointer group/checkbox">
                  <input type="checkbox" class="w-4 h-4 rounded border-gray-300 cursor-pointer accent-sky-600" />
                  <span class="text-sm text-gray-600 group-hover/checkbox:text-gray-900">Remember me</span>
                </label>
                <a href="#" class="text-sm font-semibold text-sky-600 hover:text-sky-700 transition">
                  Forgot password?
                </a>
              </div>

              <!-- Error Message -->
              <div *ngIf="error()" class="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                <app-icon name="x" size="20" color="red" class="shrink-0 mt-0.5"></app-icon>
                <span>{{ error() }}</span>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="isLoading() || loginForm.invalid"
                class="w-full py-3 px-4 bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-300 transform hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:shadow-md flex items-center justify-center gap-2"
              >
                <app-icon *ngIf="!isLoading()" name="zap" size="20" color="white"></app-icon>
                {{ isLoading() ? 'Signing in...' : 'Sign In' }}
              </button>

              <!-- Divider -->
              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <!-- Google Sign-In Button -->
              <div #googleSignInButton id="google-signin-button" class="w-full"></div>
              <p *ngIf="googleError()" class="text-red-500 text-xs mt-2 flex items-center gap-1">
                <app-icon name="alert" size="16" color="red"></app-icon>
                {{ googleError() }}
              </p>
            </form>

            <!-- Sign Up Link -->
            <div class="mt-8 pt-8 border-t border-gray-200 text-center">
              <p class="text-gray-600 text-sm">
                Don't have an account?
                <a routerLink="/auth/register" class="font-semibold text-sky-600 hover:text-sky-700 transition">
                  Create one now
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('googleSignInButton') googleSignInButton!: ElementRef;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isLoading = this.authService.isLoading;
  error = signal<string | null>(null);
  googleError = signal<string | null>(null);
  private returnUrl: string = '/dashboard';

  constructor() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.initializeGoogleAuth();
  }

  /**
   * Initialize Google Authentication
   * Load Google Sign-In library on component creation
   */
  private initializeGoogleAuth(): void {
    this.googleAuthService.initialize().catch(err => {
      console.error('Failed to initialize Google Auth:', err);
    });
  }

  /**
   * After view initialization, render Google Sign-In button
   * This runs after component template is rendered
   */
  ngAfterViewInit(): void {
    if (this.googleSignInButton?.nativeElement) {
      this.googleAuthService.initializeButton(
        this.googleSignInButton.nativeElement.id || 'google-signin-button',
        (response) => this.handleGoogleSuccess(response),
        (error) => this.handleGoogleError(error)
      );
    }
  }

  /**
   * Handle successful Google sign-in
   * Send ID token to backend for authentication
   */
  private handleGoogleSuccess(response: any): void {
    this.googleError.set(null);
    const idToken = response.credential;

    // Create Google Auth Request with default role as Client
    const googleAuthRequest: GoogleAuthRequest = {
      idToken,
      role: UserRole.Client // Default to Client (1)
    };

    // Send to backend
    this.authService.googleAuth(googleAuthRequest).subscribe({
      next: (authResponse) => {
        // Navigate based on user role
        const user = this.authService.getCurrentUser();
        if (user) {
          this.authService.navigateByRole(user, this.returnUrl);
        }
      },
      error: (err) => {
        const errorMessage =
          err.error?.message ||
          err.error?.errors?.[0] ||
          'Google sign-in failed. Please try again.';
        this.googleError.set(errorMessage);
      }
    });
  }

  /**
   * Handle Google sign-in error
   */
  private handleGoogleError(error: any): void {
    console.error('Google Sign-In error:', error);
    this.googleError.set('Failed to sign in with Google. Please try again.');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    const formValue = this.loginForm.value as { email: string; password: string };
    const credentials: LoginRequest = {
      emailOrUserName: formValue.email,
      password: formValue.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        // Navigate based on user role
        const user = this.authService.getCurrentUser();
        if (user) {
          this.authService.navigateByRole(user, this.returnUrl);
        }
      },
      error: (err: any) => {
        const errorMessage = err.error?.message || err.error?.errors?.[0] || 'Login failed. Please try again.';
        this.error.set(errorMessage);
      }
    });
  }
}
