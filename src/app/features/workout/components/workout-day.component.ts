import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { WorkoutService } from '../services/workout.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

          <div *ngIf="workoutService.currentWorkoutSession() as session" class="bg-white rounded-lg shadow-lg p-8">
            <h1 class="text-4xl font-bold text-slate-900 mb-2">{{ session.day.title }}</h1>
            <p class="text-slate-600 mb-4">{{ session.day.notes }}</p>

            <!-- Workout Summary Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p class="text-sm text-blue-600 font-semibold">Total Exercises</p>
                <p class="text-3xl font-bold text-blue-900">{{ session.exercises.length }}</p>
              </div>
              <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p class="text-sm text-green-600 font-semibold">Exercises Completed</p>
                <p class="text-3xl font-bold text-green-900">{{ completedExercisesCount() }}</p>
              </div>
              <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p class="text-sm text-purple-600 font-semibold">Total Reps Completed</p>
                <p class="text-3xl font-bold text-purple-900">{{ session.totalVolume }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Exercises List -->
        <div *ngIf="workoutService.currentWorkoutSession() as session" class="space-y-4">
          <div
            *ngFor="let exerciseProgress of session.exercises; let i = index"
            [class]="'bg-white rounded-lg shadow-lg overflow-hidden transition cursor-pointer hover:shadow-xl ' +
              (exerciseProgress.completed ? 'border-l-4 border-green-500' : 'border-l-4 border-slate-200')"
            (click)="viewExerciseDetails(exerciseProgress.exercise.exerciseId)">
            <!-- Exercise Header -->
            <div class="p-6 hover:bg-slate-50 transition">
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-2xl font-bold text-slate-400">{{ i + 1 }}</span>
                    <div>
                      <h3 class="text-xl font-bold text-slate-900">{{ exerciseProgress.exercise.excersiceName }}</h3>
                      <p class="text-sm text-slate-600">{{ exerciseProgress.exercise.muscleGroup }}</p>
                    </div>
                  </div>
                  <p *ngIf="exerciseProgress.exercise.notes" class="text-sm text-slate-600 mt-2">
                    {{ exerciseProgress.exercise.notes }}
                  </p>
                </div>

                <!-- Status Badge -->
                <div
                  [class]="'px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap ' +
                    (exerciseProgress.completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800')">
                  {{ exerciseProgress.completed ? '✓ Done' : 'Pending' }}
                </div>
              </div>

              <!-- Exercise Details -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                <div class="bg-slate-50 p-3 rounded">
                  <p class="text-slate-600 text-xs font-semibold">SETS</p>
                  <p class="text-xl font-bold text-slate-900">{{ exerciseProgress.exercise.sets }}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded">
                  <p class="text-slate-600 text-xs font-semibold">REPS</p>
                  <p class="text-xl font-bold text-slate-900">{{ exerciseProgress.exercise.reps }}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded">
                  <p class="text-slate-600 text-xs font-semibold">EQUIPMENT</p>
                  <p class="text-lg font-semibold text-slate-900">{{ exerciseProgress.exercise.equipment }}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded">
                  <p class="text-slate-600 text-xs font-semibold">REST</p>
                  <p class="text-xl font-bold text-slate-900">{{ exerciseProgress.exercise.restSeconds }}s</p>
                </div>
              </div>

              <!-- Exercise Image -->
              <div *ngIf="exerciseProgress.exercise.thumbnailUrl" class="mb-6 rounded-lg overflow-hidden bg-slate-100">
                <img
                  [src]="exerciseProgress.exercise.thumbnailUrl"
                  [alt]="exerciseProgress.exercise.excersiceName"
                  class="w-full h-48 object-cover">
              </div>

              <!-- Progress Bar -->
              <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-semibold text-slate-700">Progress</span>
                  <span class="text-sm font-bold text-slate-900">
                    {{ exerciseProgress.totalSetsCompleted }}/{{ exerciseProgress.sets.length }} sets
                  </span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div
                    [style.width.%]="(exerciseProgress.totalSetsCompleted / exerciseProgress.sets.length) * 100"
                    class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300">
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4">
                <button
                  (click)="viewExerciseDetails(exerciseProgress.exercise.exerciseId); $event.stopPropagation()"
                  class="flex-1 py-3 px-4 rounded-lg font-bold transition border-2 border-blue-500 text-blue-600 hover:bg-blue-50">
                  View Details
                </button>
                <button
                  (click)="startExercise(i); $event.stopPropagation()"
                  [disabled]="exerciseProgress.completed"
                  [class]="'flex-1 py-3 px-4 rounded-lg font-bold transition ' +
                    (exerciseProgress.completed
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg')">
                  {{ exerciseProgress.completed ? '✓ Exercise Completed' : 'Start Exercise' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Complete Workout Button -->
        <div *ngIf="workoutService.currentWorkoutSession() as session" class="mt-8 flex gap-4">
          <button
            (click)="goBack()"
            class="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition">
            Cancel Workout
          </button>
          <button
            (click)="completeWorkout()"
            [disabled]="!isAllExercisesStarted()"
            [class]="'flex-1 px-6 py-3 font-bold rounded-lg transition ' +
              (isAllExercisesStarted()
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed')">
            ✓ Complete Workout
          </button>
        </div>
      </div>
    </div>
  `
})
export class WorkoutDayComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  workoutService = inject(WorkoutService);
  private destroy$ = new Subject<void>();

  // Computed signals for template
  completedExercisesCount = computed(() => {
    const session = this.workoutService.currentWorkoutSession();
    if (!session) return 0;
    return session.exercises.filter(e => e.completed).length;
  });

  ngOnInit() {
    // Component should be initialized with workout session from service
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startExercise(exerciseIndex: number): void {
    this.workoutService.currentExerciseIndex.set(exerciseIndex);
    this.router.navigate(['/workout/exercise']);
  }

  viewExerciseDetails(exerciseId: number): void {
    this.router.navigate(['/workout/exercise-detail', exerciseId]);
  }

  isAllExercisesStarted(): boolean {
    const session = this.workoutService.currentWorkoutSession();
    if (!session) return false;
    return session.exercises.some(e => e.totalSetsCompleted > 0);
  }

  completeWorkout(): void {
    this.workoutService.endWorkout();
    // Navigate to workout summary or back to subscriptions
    this.router.navigate(['/subscriptions']);
  }

  goBack(): void {
    this.workoutService.clearWorkout();
    this.router.navigate(['/subscriptions']);
  }
}
