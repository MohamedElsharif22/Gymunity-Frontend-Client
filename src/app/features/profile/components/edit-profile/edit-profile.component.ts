import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ClientProfileService } from '../../../../core/services/client-profile.service';
import { ClientProfileRequest, ClientProfileResponse, ClientGoal, ExperienceLevel, Gender } from '../../../../core/models';
import { Subject, takeUntil, timeout } from 'rxjs';

/**
 * Edit Profile Component
 * Handles editing of client profile information
 * Integrates with AuthService for user state management
 * Uses reactive forms and Angular signals for state
 */
@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'w-full'
  }
})
export class EditProfileComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private profileService = inject(ClientProfileService);
  private formBuilder = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // Inputs and outputs
  readonly profile = input<ClientProfileResponse | null>(null);
  readonly profileSubmitted = output<ClientProfileRequest>();
  readonly editCancelled = output<void>();

  // Auth state
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly userEmail = computed(() => this.currentUser()?.email || '');
  readonly userName = computed(() => this.currentUser()?.userName || '');
  readonly authLoading = this.authService.isLoading;

  // Component state
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Enums for template
  readonly ClientGoal = ClientGoal;
  readonly ExperienceLevel = ExperienceLevel;
  readonly Gender = Gender;

  // Dropdown options
  goalOptions = [
    { value: ClientGoal.FatLoss, label: 'Fat Loss' },
    { value: ClientGoal.MuscleGain, label: 'Muscle Gain' },
    { value: ClientGoal.Maintenance, label: 'Maintenance' },
    { value: ClientGoal.Endurance, label: 'Endurance' },
    { value: ClientGoal.Flexibility, label: 'Flexibility' },
    { value: ClientGoal.Strength, label: 'Strength' },
    { value: ClientGoal.WeightLoss, label: 'Weight Loss' },
    { value: ClientGoal.WeightGain, label: 'Weight Gain' },
    { value: ClientGoal.GeneralFitness, label: 'General Fitness' }
  ];

  experienceLevelOptions = [
    { value: ExperienceLevel.Beginner, label: 'Beginner' },
    { value: ExperienceLevel.Intermediate, label: 'Intermediate' },
    { value: ExperienceLevel.Advanced, label: 'Advanced' }
  ];

  genderOptions = [
    { value: Gender.Male, label: 'Male' },
    { value: Gender.Female, label: 'Female' }
  ];

  // Form
  editForm = this.formBuilder.group({
    userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    heightCm: [null as number | null, [Validators.min(50), Validators.max(300)]],
    startingWeightKg: [null as number | null, [Validators.min(20), Validators.max(500)]],
    gender: [null as Gender | null],
    goal: [null as ClientGoal | null],
    experienceLevel: [null as ExperienceLevel | null]
  });

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const currentProfile = this.profile();
    
    if (currentProfile) {
      // Convert string enums to numeric if needed
      const gender = this.convertStringToGenderEnum(currentProfile.gender as any);
      const goal = this.convertStringToGoalEnum(currentProfile.goal as any);
      const experienceLevel = this.convertStringToExperienceLevelEnum(currentProfile.experienceLevel as any);

      this.editForm.patchValue({
        userName: currentProfile.userName || this.userName(),
        heightCm: currentProfile.heightCm ?? null,
        startingWeightKg: currentProfile.startingWeightKg ?? null,
        gender: gender ?? null,
        goal: goal ?? null,
        experienceLevel: experienceLevel ?? null
      });
    } else {
      // Pre-fill with current user info from auth service
      this.editForm.patchValue({
        userName: this.userName()
      });
    }
  }

  private convertStringToGenderEnum(value: string | Gender | undefined): Gender | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value as Gender;
    return Gender[value as keyof typeof Gender];
  }

  private convertStringToGoalEnum(value: string | ClientGoal | undefined): ClientGoal | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value as ClientGoal;
    return ClientGoal[value as keyof typeof ClientGoal];
  }

  private convertStringToExperienceLevelEnum(value: string | ExperienceLevel | undefined): ExperienceLevel | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value as ExperienceLevel;
    return ExperienceLevel[value as keyof typeof ExperienceLevel];
  }

  onSubmit(): void {
    console.log('[EditProfileComponent] Form submission attempted');
    console.log('[EditProfileComponent] Form valid:', this.editForm.valid);
    console.log('[EditProfileComponent] Form value:', this.editForm.value);

    if (this.editForm.invalid) {
      console.warn('[EditProfileComponent] Form is invalid. Errors:', this.getFormErrors());
      this.error.set('Please fill in all required fields correctly');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.editForm.value;
    const request: ClientProfileRequest = {
      userName: formValue.userName || this.userName(),
      heightCm: formValue.heightCm ?? undefined,
      startingWeightKg: formValue.startingWeightKg ?? undefined,
      gender: formValue.gender ?? undefined,
      goal: formValue.goal ?? undefined,
      experienceLevel: formValue.experienceLevel ?? undefined
    };

    const operation = this.profile() ? 'update' : 'create';
    console.log(`[EditProfileComponent] ${operation === 'update' ? 'Updating' : 'Creating'} profile:`, request);

    const service$ = operation === 'update'
      ? this.profileService.updateProfile(request)
      : this.profileService.createProfile(request);

    service$.pipe(
      timeout(10000),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedProfile) => {
        console.log('[EditProfileComponent] Profile operation successful:', updatedProfile);
        this.loading.set(false);
        this.success.set(`Profile ${operation === 'update' ? 'updated' : 'created'} successfully!`);
        
        // Emit the submitted profile
        this.profileSubmitted.emit(request);
        
        // Clear success message after 3 seconds
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('[EditProfileComponent] Profile operation error:', error);
        const errorMessage = error?.error?.message || `Failed to ${operation} profile. Please try again.`;
        this.error.set(errorMessage);
      }
    });
  }

  onCancel(): void {
    console.log('[EditProfileComponent] Cancel button clicked');
    this.resetForm();
    this.editCancelled.emit();
  }

  private resetForm(): void {
    this.editForm.reset();
    this.error.set(null);
    this.success.set(null);
    this.initializeForm();
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  // Helper methods for template
  getGoalLabel(goal: ClientGoal | undefined): string {
    if (!goal) return '';
    const option = this.goalOptions.find(o => o.value === goal);
    return option?.label || '';
  }

  getExperienceLevelLabel(level: ExperienceLevel | undefined): string {
    if (!level) return '';
    const option = this.experienceLevelOptions.find(o => o.value === level);
    return option?.label || '';
  }

  getGenderLabel(gender: Gender | undefined): string {
    if (!gender) return '';
    const option = this.genderOptions.find(o => o.value === gender);
    return option?.label || '';
  }
}
