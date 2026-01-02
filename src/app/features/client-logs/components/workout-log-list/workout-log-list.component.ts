import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientLogsService } from '../../../../core/services/client-logs.service';
import { WorkoutLogResponse } from '../../../../core/models/client-logs.model';

@Component({
  selector: 'app-workout-log-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './workout-log-list.component.html',
  styleUrl: './workout-log-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutLogListComponent implements OnInit, OnDestroy {
  private clientLogsService = inject(ClientLogsService);
  private destroy$ = new Subject<void>();

  logs = signal<WorkoutLogResponse[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.error.set('');
    this.clientLogsService.getWorkoutLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logs) => {
          this.logs.set(logs);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[WorkoutLogListComponent] Error loading logs:', err);
          this.error.set('Failed to load workout logs');
          this.loading.set(false);
        }
      });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  getExerciseCount(exercisesJson: string): number {
    try {
      const exercises = JSON.parse(exercisesJson);
      return Array.isArray(exercises) ? exercises.length : 0;
    } catch {
      return 0;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
