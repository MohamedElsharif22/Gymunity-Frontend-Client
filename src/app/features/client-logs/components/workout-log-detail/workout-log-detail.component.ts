import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientLogsService } from '../../../../core/services/client-logs.service';
import { WorkoutLogResponse } from '../../../../core/models/client-logs.model';

@Component({
  selector: 'app-workout-log-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './workout-log-detail.component.html',
  styleUrl: './workout-log-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutLogDetailComponent implements OnInit, OnDestroy {
  private clientLogsService = inject(ClientLogsService);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  log = signal<WorkoutLogResponse | null>(null);
  exercises = signal<any[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLog(parseInt(id, 10));
    }
  }

  loadLog(id: number): void {
    this.loading.set(true);
    this.error.set('');
    this.clientLogsService.getWorkoutLog(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (log) => {
          this.log.set(log);
          this.parseExercises(log.exercisesLoggedJson);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[WorkoutLogDetailComponent] Error loading log:', err);
          this.error.set('Failed to load workout log');
          this.loading.set(false);
        }
      });
  }

  private parseExercises(json: string): void {
    try {
      const parsed = JSON.parse(json);
      this.exercises.set(Array.isArray(parsed) ? parsed : []);
    } catch {
      this.exercises.set([]);
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
