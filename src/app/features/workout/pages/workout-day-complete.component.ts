import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

interface ExerciseData {
  exerciseId: number;
  exerciseName: string;
  sets: number;
  repsPerSet: number[];
  totalReps: number;
}

interface WorkoutData {
  programDayId: number;
  dayTitle: string;
  dayNotes?: string;
  exercises: ExerciseData[];
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
}

@Component({
  selector: 'app-workout-day-complete',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Success Animation -->
        <div class="text-center mb-8 animate-fadeIn">
          <div class="inline-block mb-4">
            <div class="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center animate-pulse">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">Workout Saved!</h1>
          <p class="text-xl text-slate-300">Your workout day has been completed and saved successfully</p>
        </div>

        <!-- Workout Details Card -->
        <div *ngIf="workoutData()" class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 mb-8 animate-slideDown">
          <!-- Day Header -->
          <div class="mb-8 pb-8 border-b border-white/10">
            <h2 class="text-3xl font-bold text-white mb-2">{{ workoutData()?.dayTitle }}</h2>
            <p class="text-slate-400">{{ workoutData()?.dayNotes }}</p>
          </div>

          <!-- Summary Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4 text-center">
              <p class="text-blue-300 text-sm font-semibold">EXERCISES</p>
              <p class="text-3xl font-black text-blue-400 mt-2">{{ workoutData()?.exercises?.length ?? 0 }}</p>
            </div>
            <div class="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-lg p-4 text-center">
              <p class="text-emerald-300 text-sm font-semibold">SETS</p>
              <p class="text-3xl font-black text-emerald-400 mt-2">{{ getTotalSets() }}</p>
            </div>
            <div class="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4 text-center">
              <p class="text-purple-300 text-sm font-semibold">REPS</p>
              <p class="text-3xl font-black text-purple-400 mt-2">{{ getTotalReps() }}</p>
            </div>
            <div class="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-lg p-4 text-center">
              <p class="text-orange-300 text-sm font-semibold">TIME</p>
              <p class="text-3xl font-black text-orange-400 mt-2">{{ workoutData()?.durationMinutes }}m</p>
            </div>
          </div>

          <!-- All Exercises List -->
          <h3 class="text-2xl font-bold text-white mb-6">Exercises Executed</h3>
          <div class="space-y-4">
            <div *ngFor="let exercise of workoutData()?.exercises; let idx = index" class="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/50 rounded-lg p-6 transition-all duration-300">
              <!-- Exercise Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-2xl font-bold text-slate-500">{{ idx + 1 }}</span>
                    <h4 class="text-xl font-bold text-white">{{ exercise.exerciseName }}</h4>
                  </div>
                </div>
                <span class="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-sm font-bold text-green-400">✓ Complete</span>
              </div>

              <!-- Exercise Details -->
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div class="bg-white/5 rounded p-3">
                  <p class="text-slate-500 text-xs font-semibold">SETS</p>
                  <p class="text-2xl font-bold text-white mt-1">{{ exercise.sets }}</p>
                </div>
                <div class="bg-white/5 rounded p-3">
                  <p class="text-slate-500 text-xs font-semibold">REPS PER SET</p>
                  <p class="text-xl font-bold text-white mt-1">{{ exercise.repsPerSet.join(' / ') }}</p>
                </div>
                <div class="bg-white/5 rounded p-3">
                  <p class="text-slate-500 text-xs font-semibold">TOTAL REPS</p>
                  <p class="text-2xl font-bold text-emerald-400 mt-1">{{ exercise.totalReps }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Timing Information -->
          <div class="mt-8 pt-8 border-t border-white/10">
            <h4 class="text-lg font-bold text-white mb-4">Workout Timeline</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-slate-500 font-semibold">Started</p>
                <p class="text-white mt-1">{{ formatTime(workoutData()?.startedAt) }}</p>
              </div>
              <div>
                <p class="text-slate-500 font-semibold">Completed</p>
                <p class="text-white mt-1">{{ formatTime(workoutData()?.endedAt) }}</p>
              </div>
              <div>
                <p class="text-slate-500 font-semibold">Duration</p>
                <p class="text-white mt-1">{{ workoutData()?.durationMinutes }} minutes</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button
            (click)="goToDashboard()"
            class="flex-1 px-6 py-3 border-2 border-slate-400 text-slate-300 font-bold rounded-lg hover:bg-white/10 transition-all duration-300">
            View Dashboard
          </button>
          <button
            (click)="startNewWorkout()"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 active:scale-95">
            Start Another Workout
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
export class WorkoutDayCompleteComponent implements OnInit {
  private router = inject(Router);
  private location = inject(Location);

  workoutData = signal<WorkoutData | null>(null);

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = this.location.getState() as any;
    
    if (state?.['workoutData']) {
      this.workoutData.set(state['workoutData']);
    } else if (navigation?.extras.state?.['workoutData']) {
      this.workoutData.set(navigation.extras.state['workoutData']);
    }
  }

  getTotalSets(): number {
    const data = this.workoutData();
    return data?.exercises ? data.exercises.reduce((acc, ex) => acc + ex.sets, 0) : 0;
  }

  getTotalReps(): number {
    const data = this.workoutData();
    return data?.exercises ? data.exercises.reduce((acc, ex) => acc + ex.totalReps, 0) : 0;
  }

  formatTime(dateString?: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  startNewWorkout(): void {
    this.router.navigate(['/subscriptions']);
  }
}
