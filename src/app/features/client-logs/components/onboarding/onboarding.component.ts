import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientLogsService } from '../../../../core/services/client-logs.service';
import { OnboardingRequest } from '../../../../core/models/client-logs.model';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingComponent implements OnInit, OnDestroy {
  private clientLogsService = inject(ClientLogsService);
  private formBuilder = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  loading = signal(false);
  error = signal('');
  success = signal(false);
  isCompleted = signal(false);
  checkingStatus = signal(true);

  readonly goalOptions = [
    { value: 'FatLoss', label: 'Fat Loss' },
    { value: 'MuscleGain', label: 'Muscle Gain' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Strength', label: 'Strength Building' },
    { value: 'Endurance', label: 'Endurance' },
    { value: 'Flexibility', label: 'Flexibility' },
    { value: 'GeneralFitness', label: 'General Fitness' },
    { value: 'Sports', label: 'Sports Performance' },
    { value: 'Rehab', label: 'Rehabilitation' }
  ];

  readonly experienceLevelOptions = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' }
  ];

  form = this.formBuilder.group({
    heightCm: [null as number | null, [Validators.required, Validators.min(50), Validators.max(300)]],
    startingWeightKg: [null as number | null, [Validators.required, Validators.min(20), Validators.max(500)]],
    goal: ['', Validators.required],
    experienceLevel: ['', Validators.required]
  });

  ngOnInit(): void {
    this.checkOnboardingStatus();
  }

  checkOnboardingStatus(): void {
    this.checkingStatus.set(true);
    this.clientLogsService.isOnboardingCompleted()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (completed) => {
          this.isCompleted.set(completed);
          this.checkingStatus.set(false);
        },
        error: (err) => {
          console.error('[OnboardingComponent] Error checking status:', err);
          this.checkingStatus.set(false);
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.error.set('Please fill in all required fields');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const payload: OnboardingRequest = {
      heightCm: this.form.get('heightCm')?.value || undefined,
      startingWeightKg: this.form.get('startingWeightKg')?.value || undefined,
      goal: this.form.get('goal')?.value || undefined,
      experienceLevel: this.form.get('experienceLevel')?.value || undefined
    };

    this.clientLogsService.completeOnboarding(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success.set(true);
          this.isCompleted.set(true);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[OnboardingComponent] Error completing onboarding:', err);
          this.error.set(err?.error?.message || 'Failed to complete onboarding');
          this.loading.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
