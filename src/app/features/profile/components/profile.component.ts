import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ClientProfileService } from '../../../core/services/client-profile.service';
import { ClientLogsService } from '../../../core/services/client-logs.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientProfileRequest, ClientProfileResponse, ClientGoal, ExperienceLevel, Gender, ChangePasswordRequest } from '../../../core/models';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of, timeout } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Profile Component
 * Displays and allows editing of client profile information
 * Can create new profile or update existing profile
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'min-h-screen bg-gray-50'
  }
})
export class ProfileComponent implements OnInit, OnDestroy {
  private profileService = inject(ClientProfileService);
  private logsService = inject(ClientLogsService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Auth state signals
  readonly currentUser = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly authLoading = this.authService.isLoading;

  // Computed user info
  readonly userName = computed(() => this.currentUser()?.userName || '');
  readonly userEmail = computed(() => this.currentUser()?.email || '');
  readonly userProfilePhoto = computed(() => this.currentUser()?.profilePhotoUrl || null);

  // Enums for template
  readonly ClientGoal = ClientGoal;
  readonly ExperienceLevel = ExperienceLevel;
  readonly Gender = Gender;

  // State signals
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  profile = signal<ClientProfileResponse | null>(null);
  isEditing = signal(false);
  profilePhotoPreview = signal<string | null>(null);
  selectedPhotoFile = signal<File | null>(null);
  showPasswordForm = signal(false);
  passwordLoading = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);

  // Enum options for dropdowns
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

  profileForm = this.formBuilder.group({
    // Auth Service Fields
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    profilePhoto: [null as File | null],
    // Profile Fields
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
    { validators: (fg) => this.passwordMatchValidator(fg) }
  );

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    // Fetch profile with timeout (10 seconds), other requests have shorter timeout (5 seconds)
    // If profile request hangs, we still allow editing mode
    forkJoin({
      profile: this.profileService.getProfile().pipe(
        timeout(10000), // 10 second timeout for profile
        catchError(err => {
          console.warn('[ProfileComponent] Failed to load profile:', err.message || err);
          return of(null);
        })
      ),
      bodyStateLog: this.logsService.getLastBodyStateLog().pipe(
        timeout(5000), // 5 second timeout for body state log
        catchError(err => {
          console.warn('[ProfileComponent] Failed to load body state log:', err.message || err);
          return of(null);
        })
      ),
      dashboard: this.profileService.getDashboard().pipe(
        timeout(5000), // 5 second timeout for dashboard
        catchError(err => {
          console.warn('[ProfileComponent] Failed to load dashboard:', err.message || err);
          return of(null);
        })
      )
    })
      .pipe(
        timeout(15000), // Overall 15 second timeout for entire forkJoin
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          console.log('[ProfileComponent] Profile response:', data.profile);
          console.log('[ProfileComponent] Dashboard response:', data.dashboard);
          
          // Only process if we have at least a profile response
          if (data.profile) {
            // Merge body state log and dashboard data into profile response
            let profileData = { ...data.profile };
            
            // Convert string enum values to numeric enums
            profileData.gender = this.convertStringToGenderEnum(profileData.gender as any);
            profileData.goal = this.convertStringToGoalEnum(profileData.goal as any);
            profileData.experienceLevel = this.convertStringToExperienceLevelEnum(profileData.experienceLevel as any);
            
            // If dashboard has fitness metadata, merge it
            if (data.dashboard?.summary) {
              profileData.goal = profileData.goal || this.convertStringToGoalEnum(data.dashboard.summary.goal as any);
              profileData.experienceLevel = profileData.experienceLevel || this.convertStringToExperienceLevelEnum(data.dashboard.summary.experienceLevel as any);
            }
            
            const profileWithBodyState: ClientProfileResponse = {
              ...profileData,
              bodyStateLog: data.bodyStateLog || undefined
            };
            this.profile.set(profileWithBodyState);
            this.populateForm(profileWithBodyState);
          }
          
          this.loading.set(false);
        },
        error: (error) => {
          console.error('[ProfileComponent] Error loading profile:', error.message || error);
          // Profile doesn't exist yet or API timeout - allow creation
          this.loading.set(false);
          this.isEditing.set(true);
        }
      });
  }

  private populateForm(profile: ClientProfileResponse): void {
    console.log('[ProfileComponent] Populating form with profile data:', profile);
    
    // Get current user from auth service
    const currentUser = this.currentUser();
    
    // Convert string enum values from backend to numeric enums if needed
    const gender = this.convertStringToGenderEnum(profile.gender as any);
    const goal = this.convertStringToGoalEnum(profile.goal as any);
    const experienceLevel = this.convertStringToExperienceLevelEnum(profile.experienceLevel as any);
    
    this.profileForm.patchValue({
      // Fill auth service fields from current user
      fullName: currentUser?.name || '',
      email: currentUser?.email || '',
      // Fill profile fields
      userName: profile.userName || '',
      heightCm: profile.heightCm ?? null,
      startingWeightKg: profile.startingWeightKg ?? null,
      gender: gender ?? null,
      goal: goal ?? null,
      experienceLevel: experienceLevel ?? null
    }, { emitEvent: false });
    
    console.log('[ProfileComponent] Form values after population:', this.profileForm.value);
    console.log('[ProfileComponent] Goal field value:', this.profileForm.get('goal')?.value);
    console.log('[ProfileComponent] Experience level field value:', this.profileForm.get('experienceLevel')?.value);
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

  onEdit(): void {
    this.isEditing.set(true);
  }

  onCancel(): void {
    this.isEditing.set(false);
    // Clear photo selection but keep the current user photo
    this.selectedPhotoFile.set(null);
    // Don't clear profilePhotoPreview - it might contain the updated photo
    if (this.profile()) {
      this.populateForm(this.profile()!);
    }
  }

  onSubmit(): void {
    console.log('[ProfileComponent] Form submission attempted');
    console.log('[ProfileComponent] Form valid:', this.profileForm.valid);
    console.log('[ProfileComponent] Form value:', this.profileForm.value);
    console.log('[ProfileComponent] Form errors:', this.profileForm.errors);
    
    if (this.profileForm.invalid) {
      console.warn('[ProfileComponent] Form is invalid. Errors:', this.getFormErrors());
      this.error.set('Please fill in all required fields correctly');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.profileForm.value;
    
    // Prepare profile request
    const request: ClientProfileRequest = {
      userName: formValue.userName || '',
      heightCm: formValue.heightCm ?? undefined,
      startingWeightKg: formValue.startingWeightKg ?? undefined,
      gender: formValue.gender ?? undefined,
      goal: formValue.goal ?? undefined,
      experienceLevel: formValue.experienceLevel ?? undefined
    };

    // Check if auth service fields (name, email) have been changed
    const currentUser = this.currentUser();
    const authFieldsChanged = (formValue.fullName && formValue.fullName !== currentUser?.name) ||
                              (formValue.email && formValue.email !== currentUser?.email) ||
                              this.selectedPhotoFile();

    console.log('[ProfileComponent] Auth fields changed:', authFieldsChanged);
    console.log('[ProfileComponent] Form full name:', formValue.fullName, 'Current name:', currentUser?.name);
    console.log('[ProfileComponent] Photo file selected:', this.selectedPhotoFile()?.name);

    const operation = this.profile() ? 'update' : 'create';
    console.log(`[ProfileComponent] ${operation === 'update' ? 'Updating' : 'Creating'} profile:`, request);

    // First, update auth service fields (name, email, photo) if changed
    if (authFieldsChanged && formValue.fullName && formValue.email && formValue.userName) {
      console.log('[ProfileComponent] Updating auth service fields');
      
      // Update locally in auth service
      const updatedUser = {
        ...currentUser,
        name: formValue.fullName || currentUser?.name,
        email: formValue.email || currentUser?.email,
        // If photo was selected, store the preview as the photo URL
        profilePhotoUrl: this.profilePhotoPreview() || currentUser?.profilePhotoUrl
      };
      console.log('[ProfileComponent] Updated user:', updatedUser);
      this.authService.updateCurrentUser(updatedUser as any);
      
      // Also try to update on backend with FormData
      this.authService.updateUserInfo(
        formValue.fullName,
        formValue.userName,
        formValue.email,
        this.selectedPhotoFile() || undefined
      ).pipe(
        timeout(5000),
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          console.log('[ProfileComponent] User info saved:', response);
          // Clear photo selection after successful upload
          this.selectedPhotoFile.set(null);
          // Update the profile normally
          this.updateClientProfile(request, operation);
        },
        error: (error) => {
          console.warn('[ProfileComponent] Backend update attempt failed, but local update succeeded:', error);
          // Even if backend update fails, continue with profile update
          this.selectedPhotoFile.set(null);
          this.updateClientProfile(request, operation);
        }
      });
    } else {
      // Just update the profile
      this.updateClientProfile(request, operation);
    }
  }

  private updateClientProfile(request: ClientProfileRequest, operation: 'update' | 'create'): void {
    const service$ = operation === 'update'
      ? this.profileService.updateProfile(request)
      : this.profileService.createProfile(request);

    service$.pipe(
      timeout(10000), // 10 second timeout for profile operations
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedProfile) => {
        // Handle case where backend returns null by using current profile + form values
        if (!updatedProfile) {
          console.warn('[ProfileComponent] Backend returned null response, using form values');
          const currentProfile = this.profile();
          
          // Convert string enums to numeric
          const enrichedProfile: ClientProfileResponse = {
            id: currentProfile?.id || 0,
            userName: request.userName,
            heightCm: request.heightCm,
            startingWeightKg: request.startingWeightKg,
            gender: this.convertStringToGenderEnum(request.gender as any),
            goal: this.convertStringToGoalEnum(request.goal as any),
            experienceLevel: this.convertStringToExperienceLevelEnum(request.experienceLevel as any),
            createdAt: currentProfile?.createdAt || new Date(),
            updatedAt: new Date(),
            bodyStateLog: currentProfile?.bodyStateLog
          };
          
          console.log('[ProfileComponent] Using fallback profile:', enrichedProfile);
          this.profile.set(enrichedProfile);
          this.populateForm(enrichedProfile);
          this.isEditing.set(false);
          this.loading.set(false);
          this.success.set(`Profile ${operation === 'update' ? 'updated' : 'created'} successfully!`);
          
          // Silently refresh profile data without showing loading state
          this.refreshProfileData();
          setTimeout(() => this.success.set(null), 3000);
          return;
        }

        // Ensure all fields are properly updated from the response
        console.log('[ProfileComponent] Profile response:', updatedProfile);
        console.log('[ProfileComponent] Response goal:', updatedProfile.goal, 'Type:', typeof updatedProfile.goal);
        console.log('[ProfileComponent] Response experienceLevel:', updatedProfile.experienceLevel, 'Type:', typeof updatedProfile.experienceLevel);
        
        // Convert string enum values to numeric enums
        const convertedGender = this.convertStringToGenderEnum(updatedProfile.gender as any);
        const convertedGoal = this.convertStringToGoalEnum(updatedProfile.goal as any);
        const convertedExperienceLevel = this.convertStringToExperienceLevelEnum(updatedProfile.experienceLevel as any);
        
        // Merge the submitted form values into the response (in case backend doesn't return them)
        const enrichedProfile: ClientProfileResponse = {
          id: updatedProfile.id || this.profile()?.id || 0,
          userName: updatedProfile.userName || request.userName,
          heightCm: updatedProfile.heightCm !== undefined ? updatedProfile.heightCm : request.heightCm,
          startingWeightKg: updatedProfile.startingWeightKg !== undefined ? updatedProfile.startingWeightKg : request.startingWeightKg,
          gender: convertedGender || request.gender,
          goal: convertedGoal || request.goal,
          experienceLevel: convertedExperienceLevel || request.experienceLevel,
          createdAt: updatedProfile.createdAt || this.profile()?.createdAt || new Date(),
          updatedAt: updatedProfile.updatedAt,
          bodyStateLog: updatedProfile.bodyStateLog || this.profile()?.bodyStateLog
        };
        
        console.log('[ProfileComponent] Enriched profile:', enrichedProfile);
        console.log('[ProfileComponent] Enriched goal:', enrichedProfile.goal);
        console.log('[ProfileComponent] Enriched experienceLevel:', enrichedProfile.experienceLevel);
        
        this.profile.set(enrichedProfile);
        this.populateForm(enrichedProfile); // Refresh form with updated data
        this.isEditing.set(false);
        this.loading.set(false);
        this.success.set(`Profile successfully saved!`);
        // Don't clear photo - keep it displayed
        // The photo preview will remain since we saved it to currentUser
        
        // Silently refresh profile data without showing loading state
        this.refreshProfileData();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('[ProfileComponent] Profile operation error:', error);
        const errorMessage = error?.error?.message || 'Failed to save profile. Please try again.';
        this.error.set(errorMessage);
      }
    });
  }

  onDelete(): void {
    if (!confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.profileService.deleteProfile()
      .pipe(
        timeout(10000), // 10 second timeout for delete operation
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('Profile deleted successfully');
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        },
        error: (error) => {
          this.loading.set(false);
          const errorMessage = error?.error?.message || 'Failed to delete profile. Please try again.';
          this.error.set(errorMessage);
        }
      });
  }

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

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.error.set('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.error.set('Image size must be less than 5MB');
      return;
    }

    this.selectedPhotoFile.set(file);
    this.profileForm.get('profilePhoto')?.setValue(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.profilePhotoPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    this.error.set(null);
    console.log('[ProfileComponent] Photo selected:', file.name);
  }

  clearPhotoSelection(): void {
    this.selectedPhotoFile.set(null);
    this.profilePhotoPreview.set(null);
    this.profileForm.get('profilePhoto')?.setValue(null);
    console.log('[ProfileComponent] Photo selection cleared');
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
  private passwordMatchValidator(formGroup: AbstractControl): { [key: string]: any } | null {
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
   * Note: Backend endpoint returns 405 - will use reset password flow instead
   */
  onChangePassword(): void {
    console.log('[ProfileComponent] Password change attempted');

    if (this.passwordForm.invalid) {
      console.warn('[ProfileComponent] Password form is invalid');
      this.passwordError.set('Please check your password requirements');
      return;
    }

    this.passwordLoading.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    const formValue = this.passwordForm.value;
    
    // Since /api/account/change-password returns 405, use reset password flow instead
    // The user needs to verify via email first
    this.authService.sendResetPasswordLink({ email: this.userEmail() }).pipe(
      timeout(10000),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('[ProfileComponent] Password reset link sent successfully');
        this.passwordLoading.set(false);
        this.passwordSuccess.set('Password reset link sent to your email! Check your inbox to set a new password.');
        this.passwordForm.reset();
        
        // Close form after 3 seconds
        setTimeout(() => {
          this.showPasswordForm.set(false);
          this.passwordSuccess.set(null);
        }, 3000);
      },
      error: (error) => {
        this.passwordLoading.set(false);
        console.error('[ProfileComponent] Password reset link error:', error);
        const errorMessage = error?.error?.message || 'Failed to send password reset link. Please try again.';
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

  /**
   * Silently refresh profile data without showing loading state
   * Used after successful save to update view with latest data
   */
  private refreshProfileData(): void {
    this.profileService.getProfile().pipe(
      timeout(5000),
      catchError(err => {
        console.warn('[ProfileComponent] Silent profile refresh failed:', err.message);
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        if (data) {
          // Convert enums
          data.gender = this.convertStringToGenderEnum(data.gender as any);
          data.goal = this.convertStringToGoalEnum(data.goal as any);
          data.experienceLevel = this.convertStringToExperienceLevelEnum(data.experienceLevel as any);
          
          // Update profile signal silently (no loading state)
          this.profile.set(data);
          console.log('[ProfileComponent] Profile refreshed silently');
        }
      }
    });
  }
}
