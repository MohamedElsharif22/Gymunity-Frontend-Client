import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientProfileService } from '../../../core/services/client-profile.service';
import { ClientLogsService } from '../../../core/services/client-logs.service';
import { ClientProfileRequest, ClientProfileResponse, ClientGoal, ExperienceLevel, Gender } from '../../../core/models';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
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
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'profile-container'
  }
})
export class ProfileComponent implements OnInit, OnDestroy {
  private profileService = inject(ClientProfileService);
  private logsService = inject(ClientLogsService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

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
    userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    heightCm: [null as number | null, [Validators.min(50), Validators.max(300)]],
    startingWeightKg: [null as number | null, [Validators.min(20), Validators.max(500)]],
    gender: [null as Gender | null],
    goal: [null as ClientGoal | null],
    experienceLevel: [null as ExperienceLevel | null]
  });

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

    // Fetch profile, body state log, and dashboard data in parallel
    forkJoin({
      profile: this.profileService.getProfile(),
      bodyStateLog: this.logsService.getLastBodyStateLog().pipe(
        catchError(err => {
          console.warn('[ProfileComponent] Failed to load body state log:', err);
          return of(null);
        })
      ),
      dashboard: this.profileService.getDashboard().pipe(
        catchError(err => {
          console.warn('[ProfileComponent] Failed to load dashboard:', err);
          return of(null);
        })
      )
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('[ProfileComponent] Profile response:', data.profile);
          console.log('[ProfileComponent] Dashboard response:', data.dashboard);
          
          // Merge body state log and dashboard data into profile response
          let profileData = { ...data.profile };
          
          // If dashboard has fitness metadata, merge it
          if (data.dashboard?.summary) {
            profileData.goal = profileData.goal || data.dashboard.summary.goal;
            profileData.experienceLevel = profileData.experienceLevel || data.dashboard.summary.experienceLevel;
          }
          
          const profileWithBodyState: ClientProfileResponse = {
            ...profileData,
            bodyStateLog: data.bodyStateLog || undefined
          };
          this.profile.set(profileWithBodyState);
          this.populateForm(profileWithBodyState);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('[ProfileComponent] Error loading profile:', error);
          // Profile doesn't exist yet - allow creation
          this.loading.set(false);
          this.isEditing.set(true);
        }
      });
  }

  private populateForm(profile: ClientProfileResponse): void {
    this.profileForm.patchValue({
      userName: profile.userName || '',
      heightCm: profile.heightCm || null,
      startingWeightKg: profile.startingWeightKg || null,
      gender: profile.gender || null,
      goal: profile.goal || null,
      experienceLevel: profile.experienceLevel || null
    });
  }

  onEdit(): void {
    this.isEditing.set(true);
  }

  onCancel(): void {
    this.isEditing.set(false);
    if (this.profile()) {
      this.populateForm(this.profile()!);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.error.set('Please fill in all required fields correctly');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.profileForm.value;
    const request: ClientProfileRequest = {
      userName: formValue.userName || '',
      heightCm: formValue.heightCm || undefined,
      startingWeightKg: formValue.startingWeightKg || undefined,
      gender: formValue.gender || undefined,
      goal: formValue.goal || undefined,
      experienceLevel: formValue.experienceLevel || undefined
    };

    const operation = this.profile() ? 'update' : 'create';

    const service$ = operation === 'update'
      ? this.profileService.updateProfile(request)
      : this.profileService.createProfile(request);

    service$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (updatedProfile) => {
        // Merge the submitted form values into the response (in case backend doesn't return them)
        const enrichedProfile: ClientProfileResponse = {
          ...updatedProfile,
          goal: updatedProfile.goal || request.goal,
          experienceLevel: updatedProfile.experienceLevel || request.experienceLevel,
          gender: updatedProfile.gender || request.gender,
          heightCm: updatedProfile.heightCm || request.heightCm,
          startingWeightKg: updatedProfile.startingWeightKg || request.startingWeightKg
        };
        
        this.profile.set(enrichedProfile);
        this.isEditing.set(false);
        this.loading.set(false);
        this.success.set(`Profile ${operation === 'update' ? 'updated' : 'created'} successfully!`);
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error?.error?.message || `Failed to ${operation} profile. Please try again.`;
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
      .pipe(takeUntil(this.destroy$))
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
}
