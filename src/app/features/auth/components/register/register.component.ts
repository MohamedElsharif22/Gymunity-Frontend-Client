import { Component, inject, signal, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';
import { UserRole, GoogleAuthRequest } from '../../../../core/models';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-register',
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
              <span class="text-sky-600 font-bold text-3xl">G</span>
            </div>
            <h1 class="text-5xl font-bold mb-3">Gymunity</h1>
            <p class="text-xl text-sky-100">Join Our Fitness Community</p>
          </div>

          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-md border border-white border-opacity-20">
                <app-icon name="target" size="24" color="sky"></app-icon>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-1">Personalized Programs</h3>
                <p class="text-sky-100">Get training plans tailored to your goals</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-md border border-white border-opacity-20">
                <app-icon name="users" size="24" color="sky"></app-icon>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-1">Expert Guidance</h3>
                <p class="text-sky-100">Connect with professional trainers</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-md border border-white border-opacity-20">
                <app-icon name="award" size="24" color="sky"></app-icon>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-1">Community Support</h3>
                <p class="text-sky-100">Stay motivated with thousands of members</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Register Form -->
        <div class="w-full">
          <div class="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 max-h-[90vh] overflow-y-auto">
            <!-- Mobile Branding -->
            <div class="lg:hidden text-center mb-6">
              <div class="w-14 h-14 bg-sky-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span class="text-white font-bold text-2xl">G</span>
              </div>
              <h1 class="text-2xl font-bold text-gray-900">Gymunity</h1>
              <p class="text-gray-500 text-sm mt-1">Create your account</p>
            </div>

            <!-- Form Header -->
            <div class="mb-6">
              <h2 class="text-3xl font-bold text-gray-900 mb-2">Get Started</h2>
              <p class="text-gray-600 text-sm">Join our fitness community in minutes</p>
            </div>

            <!-- Register Form -->
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Row 1: Full Name & Username -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                  <input
                    type="text"
                    formControlName="fullName"
                    placeholder="John Doe"
                    class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition duration-300 bg-gray-50 hover:bg-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Username *</label>
                  <input
                    type="text"
                    formControlName="userName"
                    placeholder="johndoe"
                    class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition duration-300 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="you@example.com"
                  class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition duration-300 bg-gray-50 hover:bg-white"
                />
              </div>

              <!-- Row 2: Password & Confirm Password -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Password *</label>
                  <input
                    type="password"
                    formControlName="password"
                    placeholder="••••••••"
                    class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition duration-300 bg-gray-50 hover:bg-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    formControlName="confirmPassword"
                    placeholder="••••••••"
                    class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition duration-300 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>

              <!-- Password Mismatch Error -->
              <p *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched" class="text-red-500 text-xs flex items-center gap-1">
                <app-icon name="alert" size="16" color="red"></app-icon>
                Passwords do not match
              </p>

              <!-- Profile Photo -->
              <div class="relative">
                <label class="block text-sm font-semibold text-gray-900 mb-2">Profile Photo <span class="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-sky-500 focus:outline-none transition duration-300 cursor-pointer file:cursor-pointer file:bg-sky-50 file:border-0 file:text-sky-600 file:font-semibold hover:bg-gray-50"
                />
              </div>

              <!-- Form Validation Errors -->
              <div *ngIf="registerForm.touched && registerForm.invalid" class="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-lg">
                <h4 class="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <app-icon name="alert" size="16" class="shrink-0"></app-icon>
                  Please fix the following:
                </h4>
                <ul class="space-y-1 text-xs text-amber-800">
                  <li *ngIf="registerForm.get('fullName')?.hasError('required')" class="flex items-center gap-1">
                    <span class="text-amber-400">•</span> Full name is required
                  </li>
                  <li *ngIf="registerForm.get('userName')?.hasError('required')" class="flex items-center gap-1">
                    <span class="text-amber-400">•</span> Username is required
                  </li>
                  <li *ngIf="registerForm.get('email')?.hasError('required')" class="flex items-center gap-1">
                    <span class="text-amber-400">•</span> Email is required
                  </li>
                  <li *ngIf="registerForm.get('email')?.hasError('email')" class="flex items-center gap-1">
                    <span class="text-amber-400">•</span> Please enter a valid email
                  </li>
                  <li *ngIf="registerForm.get('password')?.hasError('required')" class="flex items-center gap-1">
                    <span class="text-amber-400">•</span> Password is required
                  </li>
                  <li *ngIf="registerForm.get('password')?.hasError('minlength')" class="flex items-center gap-1">
                    <span class="text-amber-400">•</span> Password must be at least 6 characters
                  </li>
                  <li *ngIf="registerForm.get('confirmPassword')?.hasError('required')" class="flex items-center gap-1">
                    <span class="text-amber-400">•</span> Please confirm your password
                  </li>
                  <li *ngIf="registerForm.hasError('passwordMismatch') && registerForm.touched" class="flex items-center gap-1">
                    <span class="text-amber-400">•</span> Passwords must match
                  </li>
                </ul>
              </div>

              <!-- Error Message -->
              <div *ngIf="error()" class="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                <app-icon name="x" size="20" color="red" class="shrink-0 mt-0.5"></app-icon>
                <span>{{ error() }}</span>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="isLoading() || registerForm.invalid"
                class="w-full mt-6 py-3 px-4 bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-300 transform hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:shadow-md flex items-center justify-center gap-2"
              >
                <app-icon *ngIf="!isLoading()" name="plus" size="20" color="white"></app-icon>
                {{ isLoading() ? 'Creating Account...' : 'Create Account' }}
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

              <!-- Sign In Link -->
              <div class="text-center space-y-3 mt-6">
                <p class="text-gray-600 text-sm">
                  Already have an account?
                  <a routerLink="/auth/login" class="font-semibold text-sky-600 hover:text-sky-700 transition">
                    Sign in here
                  </a>
                </p>
                <a routerLink="/landing" class="text-gray-600 hover:text-sky-600 transition inline-flex items-center gap-1 text-sm font-medium">
                  <app-icon name="arrow-left" size="16" color="sky"></app-icon>
                  Back to Landing
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('googleSignInButton') googleSignInButton!: ElementRef;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private router = inject(Router);

  registerForm = this.fb.group(
    {
      fullName: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      profilePhoto: [null as File | null, [Validators.required]]
    },
    { validators: this.passwordMatchValidator }
  );

  isLoading = this.authService.isLoading;
  error = signal<string | null>(null);
  googleError = signal<string | null>(null);

  constructor() {
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
          this.authService.navigateByRole(user);
        }
      },
      error: (err) => {
        const errorMessage =
          err.error?.message ||
          err.error?.errors?.[0] ||
          'Google sign-up failed. Please try again.';
        this.googleError.set(errorMessage);
      }
    });
  }

  /**
   * Handle Google sign-in error
   */
  private handleGoogleError(error: any): void {
    console.error('Google Sign-In error:', error);
    this.googleError.set('Failed to sign up with Google. Please try again.');
  }

  // Validator to check if passwords match
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    const formData = new FormData();
    const formValue = this.registerForm.value;

    // Append required fields
    formData.append('fullName', formValue.fullName || '');
    formData.append('userName', formValue.userName || '');
    formData.append('email', formValue.email || '');
    formData.append('password', formValue.password || '');
    formData.append('confirmPassword', formValue.confirmPassword || '');
    formData.append('role', UserRole.Client.toString());

    // Append optional profile photo
    const profilePhoto = this.registerForm.get('profilePhoto')?.value;
    if (profilePhoto instanceof File) {
      formData.append('profilePhoto', profilePhoto);
    }

    this.authService.register(formData).subscribe({
      next: () => {
        // Navigate based on user role
        const user = this.authService.getCurrentUser();
        if (user) {
          this.authService.navigateByRole(user);
        }
      },
      error: (err: any) => {
        const errorMessage = err.error?.message || err.error?.errors?.[0] || 'Registration failed. Please try again.';
        this.error.set(errorMessage);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registerForm.get('profilePhoto')?.setValue(file);
    }
  }
}
