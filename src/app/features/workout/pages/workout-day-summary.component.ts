import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { WorkoutSessionService } from '../services/workout-session.service';
import { WorkoutLogService } from '../services/workout-log.service';

@Component({
  selector: 'app-workout-day-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Completion Badge -->
        <div *ngIf="summary()" class="text-center mb-8 animate-fadeIn">
          <div class="inline-block mb-4">
            <div class="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h1 class="text-4xl font-black text-green-400 mb-2">Workout Day Complete!</h1>
          <p class="text-slate-400 text-lg">All exercises in this day executed successfully</p>
        </div>

        <!-- Summary Card -->
        <div *ngIf="summary() as s" class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 mb-8 animate-slideDown">
          <!-- Day Info -->
          <div class="mb-8 pb-8 border-b border-white/10">
            <h2 class="text-2xl font-bold text-white mb-2">{{ s.dayTitle }}</h2>
            <p class="text-slate-400">{{ s.dayNotes }}</p>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p class="text-blue-400 text-sm font-semibold">Total Exercises</p>
              <p class="text-3xl font-bold text-blue-300 mt-2">{{ s.exercises.length }}</p>
            </div>
            <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <p class="text-emerald-400 text-sm font-semibold">Total Sets</p>
              <p class="text-3xl font-bold text-emerald-300 mt-2">{{ getTotalSets() }}</p>
            </div>
            <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p class="text-purple-400 text-sm font-semibold">Total Reps</p>
              <p class="text-3xl font-bold text-purple-300 mt-2">{{ getTotalReps() }}</p>
            </div>
            <div class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p class="text-orange-400 text-sm font-semibold">Duration</p>
              <p class="text-3xl font-bold text-orange-300 mt-2">{{ s.durationMinutes }}m</p>
            </div>
          </div>

          <!-- All Exercises Completed -->
          <h3 class="text-xl font-bold text-white mb-4">Exercises Completed</h3>
          <div class="space-y-3 mb-8">
            <div *ngFor="let ex of s.exercises; let i = index" class="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 rounded-lg p-4 transition-all duration-300">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xl font-bold text-slate-400">{{ i + 1 }}.</span>
                    <h4 class="font-bold text-white text-lg">{{ ex.exerciseName }}</h4>
                    <span class="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs font-semibold text-green-400">✓ Done</span>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span class="text-slate-500">Sets:</span>
                  <p class="font-semibold text-white">{{ ex.sets }}</p>
                </div>
                <div>
                  <span class="text-slate-500">Reps per set:</span>
                  <p class="font-semibold text-white">{{ ex.repsPerSet.join(' / ') }}</p>
                </div>
                <div>
                  <span class="text-slate-500">Total reps:</span>
                  <p class="font-semibold text-white">{{ ex.totalReps }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Timing Info -->
          <div class="bg-white/5 border border-white/10 rounded-lg p-4 mb-8">
            <p class="text-slate-400 text-sm"><strong>Started:</strong> {{ formatTime(s.startedAt) }}</p>
            <p class="text-slate-400 text-sm mt-1"><strong>Completed:</strong> {{ formatTime(s.endedAt) }}</p>
            <p class="text-slate-400 text-sm mt-1"><strong>Total Time:</strong> {{ s.durationMinutes }} minutes</p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isSaving()" class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center mb-8 animate-pulse">
          <div class="inline-block animate-spin mb-4">
            <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-slate-300 font-semibold">Saving your workout...</p>
        </div>

        <!-- Action Buttons -->
        <div *ngIf="!isSaving()" class="flex gap-4">
          <button
            (click)="goBack()"
            class="flex-1 px-6 py-3 border-2 border-slate-400 text-slate-300 font-bold rounded-lg hover:bg-white/10 transition-all duration-300">
            Back to Workout
          </button>
          <button
            (click)="saveWorkout()"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 active:scale-95">
            ✓ Save & Complete Workout
          </button>
        </div>
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
export class WorkoutDaySummaryComponent {
  private router = inject(Router);
  private sessionService = inject(WorkoutSessionService);
  private logService = inject(WorkoutLogService);

  summary = computed(() => this.sessionService.getSummary());
  isSaving = signal(false);

  getTotalSets(): number {
    const s = this.summary();
    return s ? s.exercises.reduce((acc, ex) => acc + ex.sets, 0) : 0;
  }

  getTotalReps(): number {
    const s = this.summary();
    return s ? s.exercises.reduce((acc, ex) => acc + ex.totalReps, 0) : 0;
  }

  formatTime(dateString?: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  saveWorkout(): void {
    const s = this.summary();
    if (!s) return;

    this.isSaving.set(true);

    const exercisesForLog = s.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      repsPerSet: ex.repsPerSet,
      totalReps: ex.totalReps
    }));

    const payload = {
      programDayId: s.programDayId,
      completedAt: s.endedAt || new Date().toISOString(),
      durationMinutes: s.durationMinutes,
      exercisesLoggedJson: JSON.stringify(exercisesForLog)
    };

    this.logService.createWorkoutLog(payload).subscribe({
      next: () => {
        this.sessionService.reset();
        // Navigate to workout day to show completion
        this.router.navigate(['/workout/day-complete'], { 
          state: { 
            workoutData: s,
            exercisesForLog: exercisesForLog
          }
        });
      },
      error: (err) => {
        console.error('Failed to save workout:', err);
        this.isSaving.set(false);
        alert('Failed to save workout. Please try again.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/workout/day']);
  }
}
