import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WorkoutLogService } from '../../../dashboard/services/workout-log.service';
import { WorkoutLog } from '../../../../core/models';

interface ExerciseLogged {
  exerciseId: number;
  exerciseName: string;
  sets: number;
  reps: number[];
  weight?: number;
  notes?: string;
}

@Component({
  selector: 'app-workout-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-8">
      <div class="max-w-4xl mx-auto px-6">
        <!-- Header with Back Button -->
        <div class="mb-8 flex items-center gap-4">
          <button (click)="goBack()" class="p-2 hover:bg-white/10 rounded-lg transition-all duration-300">
            <svg class="w-6 h-6 text-slate-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-4xl font-black text-white">Workout Details 💪</h1>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="space-y-6">
            <div class="h-40 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl animate-pulse"></div>
            <div class="h-80 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl animate-pulse"></div>
          </div>
        } @else if (workoutLog()) {
          <!-- Workout Summary -->
          <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-8 mb-8 animate-slideDown">
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-sky-500/10"></div>
            <div class="relative z-10">
              <h2 class="text-3xl font-bold text-white mb-6">{{ workoutLog()?.programDayName }}</h2>

              <!-- Info Grid -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <!-- Date -->
                <div class="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Date & Time</p>
                  <p class="text-sm font-bold text-white mt-2">{{ formatDate(workoutLog()?.completedAt) }}</p>
                </div>

                <!-- Duration -->
                <div class="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Duration</p>
                  <p class="text-2xl font-bold text-sky-400 mt-2">{{ workoutLog()?.durationMinutes }}m</p>
                </div>

                <!-- Total Exercises -->
                <div class="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Exercises</p>
                  <p class="text-2xl font-bold text-emerald-400 mt-2">{{ exercises().length }}</p>
                </div>

                <!-- Total Reps -->
                <div class="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Total Reps</p>
                  <p class="text-2xl font-bold text-orange-400 mt-2">{{ totalReps() }}</p>
                </div>
              </div>

              <!-- Notes -->
              @if (workoutLog()?.notes) {
                <div class="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                  <p class="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">Notes</p>
                  <p class="text-slate-300">{{ workoutLog()?.notes }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Exercises List -->
          @if (exercises().length > 0) {
            <div class="space-y-4">
              <h3 class="text-2xl font-bold text-white mb-6">Exercises Completed</h3>
              @for (exercise of exercises(); track exercise.exerciseId; let idx = $index) {
                <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:border-violet-500/50 transition-all duration-300 animate-slideDown" [style.animation-delay]="(idx * 0.05) + 's'">
                  <!-- Header -->
                  <div class="flex items-start justify-between mb-6">
                    <div>
                      <h4 class="text-xl font-bold text-white mb-1">{{ exercise.exerciseName || 'Exercise #' + exercise.exerciseId }}</h4>
                      <p class="text-sm text-slate-400">{{ exercise.sets }} set{{ exercise.sets !== 1 ? 's' : '' }}</p>
                    </div>
                    @if (exercise.weight) {
                      <div class="px-3 py-1 rounded-lg bg-violet-500/20 border border-violet-500/30">
                        <p class="text-violet-400 font-semibold">{{ exercise.weight }}kg</p>
                      </div>
                    }
                  </div>

                  <!-- Sets -->
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                    @for (reps of exercise.reps; track $index) {
                      <div class="flex flex-col items-center p-3 rounded-lg bg-white/5 border border-white/10">
                        <p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Set {{ $index + 1 }}</p>
                        <p class="text-lg font-bold text-emerald-400 mt-2">{{ reps }}</p>
                        <p class="text-xs text-slate-500">reps</p>
                      </div>
                    }
                  </div>

                  <!-- Total for Exercise -->
                  <div class="flex items-center justify-between pt-4 border-t border-white/10">
                    <p class="text-sm text-slate-400">Total Reps:</p>
                    <p class="text-xl font-bold text-emerald-400">{{ getTotalRepsForExercise(exercise.reps) }}</p>
                  </div>

                  <!-- Notes -->
                  @if (exercise.notes) {
                    <div class="mt-4 p-3 rounded-lg bg-white/5">
                      <p class="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Notes</p>
                      <p class="text-sm text-slate-300">{{ exercise.notes }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="flex flex-col items-center justify-center py-12 text-center">
              <svg class="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-slate-400 text-sm">No exercises recorded</p>
            </div>
          }

          <!-- Back to History Button -->
          <div class="mt-8 flex gap-4">
            <button (click)="goBack()" class="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-all duration-300">
              Back to History
            </button>
          </div>
        } @else if (error()) {
          <!-- Error State -->
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v2M7.08 6.06A9 9 0 1020.94 17.94M7.08 6.06l5.66 5.66m0 0l5.66-5.66"></path>
            </svg>
            <h3 class="text-2xl font-bold text-white mb-2">Workout Not Found</h3>
            <p class="text-slate-400 mb-6">The workout you're looking for doesn't exist.</p>
            <a routerLink="/workouts/history" class="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
              Back to History
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host ::ng-deep {
      .animate-slideDown {
        animation: slideDown 0.5s ease-out forwards;
        opacity: 0;
      }
    }
  `]
})
export class WorkoutDetailsComponent implements OnInit {
  private workoutLogService = inject(WorkoutLogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = signal(true);
  workoutLog = signal<WorkoutLog | null>(null);
  exercises = signal<ExerciseLogged[]>([]);
  error = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWorkoutDetails(parseInt(id, 10));
    }
  }

  loadWorkoutDetails(id: number) {
    this.isLoading.set(true);
    this.workoutLogService.getWorkoutLogById(id).subscribe({
      next: (log: WorkoutLog) => {
        this.workoutLog.set(log);
        this.parseExercises(log.exercisesLoggedJson);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load workout details:', err);
        this.error.set(true);
        this.isLoading.set(false);
      }
    });
  }

  private parseExercises(exercisesJson: string | undefined) {
    try {
      if (!exercisesJson) {
        this.exercises.set([]);
        return;
      }
      const parsed = JSON.parse(exercisesJson);
      if (Array.isArray(parsed)) {
        this.exercises.set(parsed);
      }
    } catch (e) {
      console.error('Error parsing exercises JSON:', e);
      this.exercises.set([]);
    }
  }

  getTotalRepsForExercise(reps: number[]): number {
    return Array.isArray(reps) ? reps.reduce((a, b) => a + b, 0) : 0;
  }

  get totalReps(): () => number {
    return () => {
      return this.exercises().reduce((sum, ex) => {
        const exerciseTotal = Array.isArray(ex.reps) ? ex.reps.reduce((a, b) => a + b, 0) : 0;
        return sum + exerciseTotal;
      }, 0);
    };
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack() {
    this.router.navigate(['/workouts/history']);
  }
}
