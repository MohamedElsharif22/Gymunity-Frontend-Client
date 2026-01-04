import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { WorkoutSessionService } from '../services/workout-session.service';

interface ExerciseUI {
  exerciseId: number;
  excersiceName: string;
  muscleGroup: string;
  notes?: string;
  sets: number;
  reps: number;
  equipment: string;
  restSeconds: number;
  thumbnailUrl?: string;
  completed: boolean;
}

@Component({
  selector: 'app-workout-day',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <button
            (click)="goBack()"
            class="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>

          <div *ngIf="session() as s" class="bg-white rounded-lg shadow-lg p-8">
            <h1 class="text-4xl font-bold text-slate-900 mb-2">{{ s.dayTitle }}</h1>
            <p class="text-slate-600 mb-4">{{ s.dayNotes }}</p>

            <!-- Workout Summary Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p class="text-sm text-blue-600 font-semibold">Total Exercises</p>
                <p class="text-3xl font-bold text-blue-900">{{ s.exercises.length }}</p>
              </div>
              <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p class="text-sm text-green-600 font-semibold">Exercises Completed</p>
                <p class="text-3xl font-bold text-green-900">{{ completedCount() }}</p>
              </div>
              <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p class="text-sm text-purple-600 font-semibold">Total Reps Completed</p>
                <p class="text-3xl font-bold text-purple-900">{{ getTotalRepsCompleted() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Exercises List -->
        <div *ngIf="session() as s" class="space-y-4">
          <div
            *ngFor="let exercise of getExercisesUI(); let i = index"
            [class]="'bg-white rounded-lg shadow-lg overflow-hidden transition cursor-pointer hover:shadow-xl ' +
              (exercise.completed ? 'border-l-4 border-green-500' : 'border-l-4 border-slate-200')">
            <!-- Exercise Header -->
            <div class="p-6 hover:bg-slate-50 transition">
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-2xl font-bold text-slate-400">{{ i + 1 }}</span>
                    <div>
                      <h3 class="text-xl font-bold text-slate-900">{{ exercise.excersiceName }}</h3>
                      <p class="text-sm text-slate-600">{{ exercise.muscleGroup }}</p>
                    </div>
                  </div>
                  <p *ngIf="exercise.notes" class="text-sm text-slate-600 mt-2">
                    {{ exercise.notes }}
                  </p>
                </div>

                <!-- Status Badge -->
                <div
                  [class]="'px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap ' +
                    (exercise.completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800')">
                  {{ exercise.completed ? '✓ Done' : 'Pending' }}
                </div>
              </div>

              <!-- Exercise Details -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                <div class="bg-slate-50 p-3 rounded">
                  <p class="text-slate-600 text-xs font-semibold">SETS</p>
                  <p class="text-xl font-bold text-slate-900">{{ exercise.sets }}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded">
                  <p class="text-slate-600 text-xs font-semibold">REPS</p>
                  <p class="text-xl font-bold text-slate-900">{{ exercise.reps }}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded">
                  <p class="text-slate-600 text-xs font-semibold">EQUIPMENT</p>
                  <p class="text-lg font-semibold text-slate-900">{{ exercise.equipment }}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded">
                  <p class="text-slate-600 text-xs font-semibold">REST</p>
                  <p class="text-xl font-bold text-slate-900">{{ exercise.restSeconds }}s</p>
                </div>
              </div>

              <!-- Exercise Image -->
              <div *ngIf="exercise.thumbnailUrl" class="mb-6 rounded-lg overflow-hidden bg-slate-100">
                <img
                  [src]="exercise.thumbnailUrl"
                  [alt]="exercise.excersiceName"
                  class="w-full h-48 object-cover">
              </div>

              <!-- Progress Bar -->
              <div class="mb-6" *ngIf="exercise.completed">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-semibold text-slate-700">Progress</span>
                  <span class="text-sm font-bold text-slate-900">
                    {{ exercise.sets }}/{{ exercise.sets }} sets
                  </span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div
                    style="width: 100%"
                    class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300">
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4">
                <button
                  (click)="startExercise(exercise.exerciseId); $event.stopPropagation()"
                  [disabled]="exercise.completed"
                  [class]="'flex-1 py-3 px-4 rounded-lg font-bold transition ' +
                    (exercise.completed
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg')">
                  {{ exercise.completed ? '✓ Exercise Completed' : 'Execute Exercise' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Complete Workout Button -->
        <div *ngIf="session() as s" class="mt-8 flex gap-4">
          <button
            (click)="goBack()"
            class="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition">
            Cancel Workout
          </button>
          <button
            (click)="finishWorkoutDay()"
            [disabled]="!isAllExercisesCompleted()"
            [class]="'flex-1 px-6 py-3 font-bold rounded-lg transition ' +
              (isAllExercisesCompleted()
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed')">
            ✓ Finish Workout Day
          </button>
        </div>
      </div>
    </div>
  `
})
export class WorkoutDayComponent implements OnInit {
  private router = inject(Router);
  protected sessionService = inject(WorkoutSessionService);

  session = computed(() => this.sessionService.session());
  completedCount = computed(() => {
    const s = this.session();
    return s ? s.exercises.filter(ex => ex.repsPerSet && ex.repsPerSet.length > 0).length : 0;
  });

  ngOnInit(): void {
    // Session should already be initialized before navigating to this page
  }

  getExercisesUI(): ExerciseUI[] {
    const s = this.session();
    if (!s) return [];

    return s.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      excersiceName: ex.exerciseName,
      muscleGroup: '',
      sets: ex.sets,
      reps: 0,
      equipment: '',
      restSeconds: 0,
      completed: ex.repsPerSet && ex.repsPerSet.length > 0
    }));
  }

  getTotalRepsCompleted(): number {
    const s = this.session();
    if (!s) return 0;
    return s.exercises.reduce((total, ex) => total + ex.totalReps, 0);
  }

  isAllExercisesCompleted(): boolean {
    return this.sessionService.isAllExercisesCompleted();
  }

  startExercise(exerciseId: number): void {
    this.router.navigate(['/workout/execute', exerciseId]);
  }

  finishWorkoutDay(): void {
    this.router.navigate(['/workout/summary']);
  }

  goBack(): void {
    this.sessionService.reset();
    this.router.navigate(['/subscriptions']);
  }
}
