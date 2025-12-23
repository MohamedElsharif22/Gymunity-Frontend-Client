import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-sky-600 to-sky-800 flex items-center justify-center px-4 py-8">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <!-- Logo Section -->
        <div class="bg-gradient-to-r from-sky-600 to-sky-800 p-8 text-center rounded-t-2xl">
          <div class="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
            <span class="text-sky-600 font-bold text-2xl">G</span>
          </div>
          <h1 class="text-3xl font-bold text-white">Gymunity</h1>
          <p class="text-sky-100 mt-2">Join Our Fitness Community</p>
        </div>

        <!-- Register Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="p-8 space-y-4">
          <!-- Full Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
            <input
              type="text"
              formControlName="fullName"
              placeholder="Enter your full name"
              class="input-field"
            />
          </div>

          <!-- Username -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Username</label>
            <input
              type="text"
              formControlName="userName"
              placeholder="Choose a username"
              class="input-field"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Email</label>
            <input
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              class="input-field"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Password</label>
            <input
              type="password"
              formControlName="password"
              placeholder="Create a password"
              class="input-field"
            />
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
            <input
              type="password"
              formControlName="confirmPassword"
              placeholder="Confirm your password"
              class="input-field"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="isLoading() || registerForm.invalid"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {{ isLoading() ? 'Creating Account...' : 'Create Account' }}
          </button>

          <!-- Error Message -->
          <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ error() }}
          </div>
        </form>

        <!-- Sign In Link -->
        <div class="px-8 pb-8 text-center text-gray-600 border-t border-gray-200 pt-6">
          Already have an account?
          <a routerLink="/auth/login" class="font-semibold text-sky-600 hover:text-sky-700">
            Sign in
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    fullName: ['', [Validators.required]],
    userName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    profilePhoto: [null as File | null]
  });

  isLoading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);

    const formData = new FormData();
    const formValue = this.registerForm.value;

    formData.append('fullName', formValue.fullName || '');
    formData.append('userName', formValue.userName || '');
    formData.append('email', formValue.email || '');
    formData.append('password', formValue.password || '');
    formData.append('confirmPassword', formValue.confirmPassword || '');
    formData.append('role', UserRole.Client.toString());

    if (this.registerForm.get('profilePhoto')?.value) {
      const file = this.registerForm.get('profilePhoto')?.value;
      if (file instanceof File) {
        formData.append('profilePhoto', file);
      }
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/onboarding']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
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
