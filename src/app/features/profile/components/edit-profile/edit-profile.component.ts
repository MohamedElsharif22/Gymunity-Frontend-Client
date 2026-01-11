import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ClientProfileService } from '../../../../core/services/client-profile.service';
import { ClientProfileRequest, ClientProfileResponse, ClientGoal, ExperienceLevel, Gender, ChangePasswordRequest } from '../../../../core/models';
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
  showPasswordForm = signal(false);
  passwordLoading = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);

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

  // Password change form
  passwordForm = this.formBuilder.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+{}[\]|;:'"",.<>\/\\]).{8,}$/)
        ]
      ],
      confirmNewPassword: ['', [Validators.required]]
    },
    {
      validators: this.passwordMatchValidator
    }
  );

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

  /**
   * Check if a form field is invalid and touched
   * Used for showing error messages
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Check if a form field has a specific error
   * Used for conditional error message display
   */
  hasFieldError(fieldName: string, errorType: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  /**
   * Get form validation status
   * Returns true if form is ready to submit
   */
  isFormReady(): boolean {
    return this.editForm.valid && !this.loading() && !this.authLoading();
  }

  // ===== PASSWORD MANAGEMENT METHODS =====

  /**
   * Toggle password change form visibility
   */
  togglePasswordForm(): void {
    this.showPasswordForm.update(val => !val);
    if (this.showPasswordForm()) {
      this.passwordError.set(null);
      this.passwordSuccess.set(null);
    } else {
      this.passwordForm.reset();
    }
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(formGroup: any): { [key: string]: any } | null {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmNewPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Get password validation status
   */
  isPasswordFormReady(): boolean {
    return this.passwordForm.valid && !this.passwordLoading();
  }

  /**
   * Check password field validity
   */
  isPasswordFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Change user password
   * Uses AuthService.changePassword method
   */
  onChangePassword(): void {
    console.log('[EditProfileComponent] Password change attempted');

    if (this.passwordForm.invalid) {
      console.warn('[EditProfileComponent] Password form is invalid');
      this.passwordError.set('Please check your password requirements');
      return;
    }

    this.passwordLoading.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    const formValue = this.passwordForm.value;
    const request: ChangePasswordRequest = {
      currentPassword: formValue.currentPassword || '',
      newPassword: formValue.newPassword || '',
      confirmPassword: formValue.confirmNewPassword || ''
    };

    console.log('[EditProfileComponent] Sending change password request');

    this.authService.changePassword(request).pipe(
      timeout(10000),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('[EditProfileComponent] Password changed successfully');
        this.passwordLoading.set(false);
        this.passwordSuccess.set('Password changed successfully! ✓');
        this.passwordForm.reset();
        
        // Close form after 2 seconds
        setTimeout(() => {
          this.showPasswordForm.set(false);
          this.passwordSuccess.set(null);
        }, 2000);
      },
      error: (error) => {
        this.passwordLoading.set(false);
        console.error('[EditProfileComponent] Password change error:', error);
        const errorMessage = error?.error?.message || 'Failed to change password. Please check your current password and try again.';
        this.passwordError.set(errorMessage);
      }
    });
  }

  /**
   * Cancel password change
   */
  onCancelPasswordChange(): void {
    this.passwordForm.reset();
    this.passwordError.set(null);
    this.passwordSuccess.set(null);
    this.showPasswordForm.set(false);
  }

  /**
   * Get password strength indicator
   * Returns strength level based on validation
   */
  getPasswordStrength(): { level: string; color: string } {
    const password = this.passwordForm.get('newPassword')?.value;
    if (!password) return { level: '', color: '' };

    let strength = 0;
    
    // Check length
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Check for uppercase
    if (/[A-Z]/.test(password)) strength++;
    
    // Check for lowercase
    if (/[a-z]/.test(password)) strength++;
    
    // Check for numbers
    if (/\d/.test(password)) strength++;
    
    // Check for special characters
    if (/[@$!%*?&#^()\-_=+{}[\]|;:'"",.<>\/\\]/.test(password)) strength++;

    if (strength <= 2) return { level: 'Weak', color: 'text-red-600' };
    if (strength <= 4) return { level: 'Fair', color: 'text-yellow-600' };
    return { level: 'Strong', color: 'text-green-600' };
  }
}
