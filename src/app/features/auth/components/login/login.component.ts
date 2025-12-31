import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-linear-to-br from-sky-600 to-sky-800 flex items-center justify-center px-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-sky-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-2xl">G</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">Gymunity</h1>
          <p class="text-gray-500 mt-2">Your Fitness Journey Starts Here</p>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Email/Username -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Email or Username</label>
            <input
              type="text"
              formControlName="emailOrUserName"
              placeholder="Enter your email or username"
              class="input-field"
            />
            <p *ngIf="loginForm.get('emailOrUserName')?.invalid && loginForm.get('emailOrUserName')?.touched" class="text-red-500 text-sm mt-1">
              Please enter a valid email or username
            </p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Password</label>
            <input
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              class="input-field"
            />
            <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
              Password is required
            </p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 rounded border-gray-300" />
              <span class="text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" class="text-sm font-semibold text-sky-600 hover:text-sky-700">
              Forgot password?
            </a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="isLoading() || loginForm.invalid"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading() ? 'Signing in...' : 'Sign In' }}
          </button>

          <!-- Error Message -->
          <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error() }}
          </div>
        </form>

        <!-- Sign Up Link -->
        <p class="text-center text-gray-600 mt-8">
          Don't have an account?
          <a routerLink="/auth/register" class="font-semibold text-sky-600 hover:text-sky-700">
            Sign up
          </a>
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    emailOrUserName: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  isLoading = this.authService.isLoading;
  error = signal<string | null>(null);

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    const credentials: LoginRequest = this.loginForm.value as LoginRequest;
    
    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        const errorMessage = err.error?.message || err.error?.errors?.[0] || 'Login failed. Please try again.';
        this.error.set(errorMessage);
      }
    });
  }
}
