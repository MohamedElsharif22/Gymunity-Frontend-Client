import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientProfileService } from '../services/client-profile.service';
import { OnboardingCompleteRequest, ClientProfile } from '../../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900">{{ isEditMode() ? 'Edit Your Profile' : 'Complete Your Profile' }}</h1>
          <p class="text-gray-600 mt-2">{{ isEditMode() ? 'Update your fitness information' : 'Help us personalize your fitness journey' }}</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="profileLoading()" class="bg-white rounded-xl shadow-md p-8 mb-8">
          <div class="flex items-center justify-center space-x-3">
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
            <span class="text-gray-600 ml-4">Loading your profile...</span>
          </div>
        </div>

        <!-- Profile Form Card -->
        <div class="bg-white rounded-xl shadow-md p-8" *ngIf="!profileLoading()">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Height -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Height (cm)</label>
              <input
                type="number"
                formControlName="heightCm"
                placeholder="Enter your height in centimeters"
                class="input-field"
                min="100"
                max="250"
              />
              <p *ngIf="profileForm.get('heightCm')?.invalid && profileForm.get('heightCm')?.touched" class="text-red-600 text-sm mt-1">
                Height is required and must be between 100-250 cm
              </p>
            </div>

            <!-- Starting Weight -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Starting Weight (kg)</label>
              <input
                type="number"
                formControlName="startingWeightKg"
                placeholder="Enter your starting weight"
                class="input-field"
                min="20"
                max="500"
              />
              <p *ngIf="profileForm.get('startingWeightKg')?.invalid && profileForm.get('startingWeightKg')?.touched" class="text-red-600 text-sm mt-1">
                Weight is required and must be between 20-500 kg
              </p>
            </div>

            <!-- Gender -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Gender</label>
              <select formControlName="gender" class="input-field">
                <option value="" [selected]="!profileForm.get('gender')?.value">Select your gender</option>
                <option value="male" [selected]="profileForm.get('gender')?.value === 'male'">Male</option>
                <option value="female" [selected]="profileForm.get('gender')?.value === 'female'">Female</option>
                <option value="other" [selected]="profileForm.get('gender')?.value === 'other'">Other</option>
              </select>
              <p *ngIf="profileForm.get('gender')?.invalid && profileForm.get('gender')?.touched" class="text-red-600 text-sm mt-1">
                Gender is required
              </p>
            </div>

            <!-- Fitness Goal -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Fitness Goal</label>
              <select formControlName="goal" class="input-field">
                <option value="" [selected]="!profileForm.get('goal')?.value">Select your fitness goal</option>
                <option value="weight_loss" [selected]="profileForm.get('goal')?.value === 'weight_loss'">Weight Loss</option>
                <option value="muscle_gain" [selected]="profileForm.get('goal')?.value === 'muscle_gain'">Muscle Gain</option>
                <option value="strength" [selected]="profileForm.get('goal')?.value === 'strength'">Strength Building</option>
                <option value="endurance" [selected]="profileForm.get('goal')?.value === 'endurance'">Endurance</option>
                <option value="flexibility" [selected]="profileForm.get('goal')?.value === 'flexibility'">Flexibility</option>
                <option value="general_fitness" [selected]="profileForm.get('goal')?.value === 'general_fitness'">General Fitness</option>
              </select>
              <p *ngIf="profileForm.get('goal')?.invalid && profileForm.get('goal')?.touched" class="text-red-600 text-sm mt-1">
                Fitness goal is required
              </p>
            </div>

            <!-- Experience Level -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Experience Level</label>
              <select formControlName="experienceLevel" class="input-field">
                <option value="" [selected]="!profileForm.get('experienceLevel')?.value">Select your experience level</option>
                <option value="beginner" [selected]="profileForm.get('experienceLevel')?.value === 'beginner'">Beginner</option>
                <option value="intermediate" [selected]="profileForm.get('experienceLevel')?.value === 'intermediate'">Intermediate</option>
                <option value="advanced" [selected]="profileForm.get('experienceLevel')?.value === 'advanced'">Advanced</option>
                <option value="professional" [selected]="profileForm.get('experienceLevel')?.value === 'professional'">Professional</option>
              </select>
              <p *ngIf="profileForm.get('experienceLevel')?.invalid && profileForm.get('experienceLevel')?.touched" class="text-red-600 text-sm mt-1">
                Experience level is required
              </p>
            </div>

            <!-- Error Message -->
            <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {{ error() }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading() || profileForm.invalid || profileLoading()"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {{ isLoading() ? (isEditMode() ? 'Updating Profile...' : 'Saving Profile...') : (isEditMode() ? 'Update Profile' : 'Complete Profile') }}
            </button>

            <!-- Cancel Button (Edit Mode Only) -->
            <button
              *ngIf="isEditMode()"
              type="button"
              (click)="onCancel()"
              [disabled]="isLoading()"
              class="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private profileService = inject(ClientProfileService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  profileForm = this.fb.group({
    heightCm: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
    startingWeightKg: ['', [Validators.required, Validators.min(20), Validators.max(500)]],
    gender: ['', [Validators.required]],
    goal: ['', [Validators.required]],
    experienceLevel: ['', [Validators.required]]
  });

  isLoading = signal(false);
  profileLoading = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  returnUrl = '';
  currentProfile: ClientProfile | null = null;

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.loadProfileData();
  }

  /**
   * Load existing profile data from backend
   * If profile exists, populate form and set to edit mode
   * If profile doesn't exist (404), component is in creation mode
   */
  private loadProfileData() {
    this.profileLoading.set(true);
    this.error.set(null);

    this.profileService.getMyProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: ClientProfile) => {
          this.currentProfile = profile;
          this.isEditMode.set(true);

          // Populate form with existing profile data using patchValue
          this.profileForm.patchValue({
            heightCm: profile.heightCm.toString(),
            startingWeightKg: profile.startingWeightKg.toString(),
            gender: profile.gender,
            goal: profile.goal,
            experienceLevel: profile.experienceLevel
          });

          this.profileLoading.set(false);
          console.log('[ProfileComponent] Profile loaded successfully:', profile);
        },
        error: (err: any) => {
          // Profile doesn't exist yet - user is in creation mode
          this.isEditMode.set(false);
          this.profileLoading.set(false);

          // This is expected for new users (404), not an error
          if (err.status !== 404) {
            console.warn('[ProfileComponent] Error loading profile:', err);
          }
        }
      });
  }

  onCancel() {
    if (this.profileForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.router.navigateByUrl(this.returnUrl);
      }
    } else {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const formData = this.profileForm.value as unknown as OnboardingCompleteRequest;

    // Use different endpoint based on mode
    const request$ = this.isEditMode()
      ? this.profileService.updateProfile(formData as any)
      : this.profileService.completeOnboarding(formData);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          console.log('[ProfileComponent] Profile saved successfully');
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err: any) => {
          this.isLoading.set(false);
          const errorMessage = err.error?.message || err.error?.errors?.[0] || 'Failed to save profile. Please try again.';
          this.error.set(errorMessage);
          console.error('[ProfileComponent] Error saving profile:', err);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
