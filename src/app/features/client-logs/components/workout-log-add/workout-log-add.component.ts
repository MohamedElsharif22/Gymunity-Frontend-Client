import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientLogsService } from '../../../../core/services/client-logs.service';
import { WorkoutLogRequest } from '../../../../core/models/client-logs.model';

@Component({
  selector: 'app-workout-log-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workout-log-add.component.html',
  styleUrl: './workout-log-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutLogAddComponent implements OnInit, OnDestroy {
  private clientLogsService = inject(ClientLogsService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  loading = signal(false);
  error = signal('');
  success = signal(false);
  exercisesError = signal('');

  form = this.formBuilder.group({
    programDayId: [null as number | null, Validators.required],
    durationMinutes: [null as number | null, [Validators.min(1), Validators.max(600)]],
    exercisesLoggedJson: ['', Validators.required],
    notes: ['']
  });

  ngOnInit(): void {
    // Initialize form
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.error.set('Please fill in all required fields');
      return;
    }

    // Validate exercises JSON
    const exercisesJson = this.form.get('exercisesLoggedJson')?.value;
    if (exercisesJson) {
      try {
        JSON.parse(exercisesJson);
        this.exercisesError.set('');
      } catch {
        this.exercisesError.set('Exercises must be valid JSON');
        return;
      }
    }

    this.loading.set(true);
    this.error.set('');

    const payload: WorkoutLogRequest = {
      programDayId: this.form.get('programDayId')?.value || 0,
      durationMinutes: this.form.get('durationMinutes')?.value || undefined,
      exercisesLoggedJson: exercisesJson || undefined,
      notes: this.form.get('notes')?.value || undefined
    };

    this.clientLogsService.addWorkoutLog(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success.set(true);
          this.loading.set(false);
          setTimeout(() => {
            this.router.navigate(['/workout-logs']);
          }, 1500);
        },
        error: (err) => {
          console.error('[WorkoutLogAddComponent] Error adding log:', err);
          this.error.set(err?.error?.message || 'Failed to add workout log');
          this.loading.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
