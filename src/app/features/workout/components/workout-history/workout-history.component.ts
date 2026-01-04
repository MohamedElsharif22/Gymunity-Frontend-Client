import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WorkoutLogService } from '../../../dashboard/services/workout-log.service';
import { WorkoutLog } from '../../../../core/models';

interface WorkoutHistoryItem {
  id: number;
  programDayName: string;
  completedAt: Date;
  durationMinutes: number;
  totalExercises: number;
  totalSets: number;
  totalReps: number;
}

@Component({
  selector: 'app-workout-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-8">
      <div class="max-w-6xl mx-auto px-6">
        <!-- Header -->
        <div class="mb-8 animate-fadeIn">
          <h1 class="text-4xl font-black text-white mb-2">Workout History 📋</h1>
          <p class="text-slate-400">View all your completed workouts and progress</p>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (_ of [1, 2, 3, 4, 5, 6]; track $index) {
              <div class="h-64 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl animate-pulse"></div>
            }
          </div>
        } @else if (workoutHistory().length > 0) {
          <!-- Workout Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (workout of workoutHistory(); track workout.id; let idx = $index) {
              <a [routerLink]="['/workouts/history', workout.id]" class="group">
                <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20 h-full animate-slideDown cursor-pointer" [style.animation-delay]="(idx * 0.05) + 's'">
                  <!-- Background Gradient -->
                  <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-emerald-500/5 transition-all duration-300"></div>

                  <!-- Content -->
                  <div class="relative z-10 flex flex-col h-full">
                    <!-- Title -->
                    <h3 class="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {{ workout.programDayName }}
                    </h3>

                    <!-- Date -->
                    <p class="text-sm text-slate-400 mb-4">
                      {{ formatDate(workout.completedAt) }}
                    </p>

                    <!-- Divider -->
                    <div class="w-8 h-1 bg-gradient-to-r from-emerald-400 to-transparent mb-4"></div>

                    <!-- Stats Grid -->
                    <div class="grid grid-cols-2 gap-4 flex-grow">
                      <!-- Duration -->
                      <div class="p-3 rounded-lg bg-white/5 border border-white/10 group-hover:border-sky-500/30 transition-colors">
                        <p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Duration</p>
                        <p class="text-lg font-bold text-sky-400 mt-1">{{ workout.durationMinutes }}m</p>
                      </div>

                      <!-- Total Exercises -->
                      <div class="p-3 rounded-lg bg-white/5 border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                        <p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Exercises</p>
                        <p class="text-lg font-bold text-emerald-400 mt-1">{{ workout.totalExercises }}</p>
                      </div>

                      <!-- Total Sets -->
                      <div class="p-3 rounded-lg bg-white/5 border border-white/10 group-hover:border-violet-500/30 transition-colors">
                        <p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Sets</p>
                        <p class="text-lg font-bold text-violet-400 mt-1">{{ workout.totalSets }}</p>
                      </div>

                      <!-- Total Reps -->
                      <div class="p-3 rounded-lg bg-white/5 border border-white/10 group-hover:border-orange-500/30 transition-colors">
                        <p class="text-xs text-slate-500 uppercase tracking-wide font-medium">Reps</p>
                        <p class="text-lg font-bold text-orange-400 mt-1">{{ workout.totalReps }}</p>
                      </div>
                    </div>

                    <!-- Arrow -->
                    <div class="mt-4 flex items-center justify-end">
                      <svg class="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <svg class="w-24 h-24 text-slate-600 mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            <h3 class="text-2xl font-bold text-white mb-2">No Workouts Yet</h3>
            <p class="text-slate-400 mb-6 max-w-sm">Start your first workout to see your history here. Complete all exercises in a day to log it.</p>
            <a routerLink="/workout/day" class="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
              Start Workout
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

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
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }

      .animate-slideDown {
        animation: slideDown 0.5s ease-out forwards;
        opacity: 0;
      }
    }
  `]
})
export class WorkoutHistoryComponent implements OnInit {
  private workoutLogService = inject(WorkoutLogService);

  isLoading = signal(true);
  workoutHistory = signal<WorkoutHistoryItem[]>([]);

  ngOnInit() {
    this.loadWorkoutHistory();
  }

  loadWorkoutHistory() {
    this.isLoading.set(true);
    this.workoutLogService.getWorkoutLogs(1, 100).subscribe({
      next: (response: any) => {
        const logs = response.data || [];
        const history = logs.map((log: WorkoutLog) => this.parseWorkoutLog(log));
        this.workoutHistory.set(history);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load workout history:', err);
        this.isLoading.set(false);
      }
    });
  }

  private parseWorkoutLog(log: WorkoutLog): WorkoutHistoryItem {
    let totalExercises = 0;
    let totalSets = 0;
    let totalReps = 0;

    try {
      if (log.exercisesLoggedJson) {
        const exercises = JSON.parse(log.exercisesLoggedJson);
        if (Array.isArray(exercises)) {
          totalExercises = exercises.length;
          totalSets = exercises.reduce((sum: number, ex: any) => sum + (ex.sets || 0), 0);
          totalReps = exercises.reduce((sum: number, ex: any) => {
            const reps = ex.reps || [];
            return sum + (Array.isArray(reps) ? reps.reduce((a: number, b: number) => a + b, 0) : 0);
          }, 0);
        }
      }
    } catch (e) {
      console.error('Error parsing exercises JSON:', e);
    }

    return {
      id: log.id,
      programDayName: log.programDayName || 'Workout',
      completedAt: new Date(log.completedAt),
      durationMinutes: log.durationMinutes || 0,
      totalExercises,
      totalSets,
      totalReps
    };
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
