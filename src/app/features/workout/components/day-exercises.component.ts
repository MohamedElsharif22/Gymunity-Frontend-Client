import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkoutService } from '../services/workout.service';
import { ProgramBrowseService } from '../services/program-browse.service';
import { ProgramDay } from '../../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-day-exercises',
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

          <div *ngIf="isLoading()" class="text-center py-12">
            <div class="inline-block">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p class="text-slate-600 mt-4">Loading exercises...</p>
            </div>
          </div>

          <div *ngIf="!isLoading() && day() as dayData" class="bg-white rounded-lg shadow-lg p-8">
            <h1 class="text-4xl font-bold text-slate-900 mb-2">{{ dayData.title }}</h1>
            <p class="text-slate-600 mb-6">{{ dayData.notes }}</p>

            <!-- Day Summary -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p class="text-sm text-blue-600 font-semibold">Total Exercises</p>
                <p class="text-3xl font-bold text-blue-900">{{ dayData.exercises?.length || 0 }}</p>
              </div>
              <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p class="text-sm text-green-600 font-semibold">Total Sets</p>
                <p class="text-3xl font-bold text-green-900">{{ calculateTotalSets(dayData) }}</p>
              </div>
              <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p class="text-sm text-purple-600 font-semibold">Estimated Duration</p>
                <p class="text-3xl font-bold text-purple-900">~45-60 min</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Exercises List -->
        <div *ngIf="!isLoading() && day() as dayData" class="space-y-4">
          <div
            *ngFor="let exercise of dayData.exercises || []; let i = index"
            (click)="onExecuteExercise(i)"
            class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer hover:bg-slate-50">
            <!-- Exercise Header -->
            <div class="p-6 border-l-4 border-blue-500">
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

              <!-- Exercise Image (show placeholder when missing) -->
              <ng-container *ngIf="exercise.thumbnailUrl; else placeholderImage">
                <div class="mb-6 rounded-lg overflow-hidden bg-slate-100">
                  <img
                    [src]="exercise.thumbnailUrl"
                    [alt]="exercise.excersiceName"
                    class="w-full h-64 object-cover">
                </div>
              </ng-container>
              <ng-template #placeholderImage>
                <div class="mb-6 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center h-64">
                  <div class="text-center text-slate-400">
                    <svg class="mx-auto mb-2" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M8 14s1.5-2 4-2 4 2 4 2"></path><circle cx="12" cy="10" r="2"></circle></svg>
                    <div class="font-semibold">No image</div>
                  </div>
                </div>
              </ng-template>

              <!-- Exercise Category & Info -->
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div class="bg-slate-50 p-3 rounded">
                  <p class="text-xs text-slate-600 font-semibold">CATEGORY</p>
                  <p class="text-sm font-bold text-slate-900">{{ exercise.category }}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded">
                  <p class="text-xs text-slate-600 font-semibold">MUSCLE GROUP</p>
                  <p class="text-sm font-bold text-slate-900">{{ exercise.muscleGroup }}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded">
                  <p class="text-xs text-slate-600 font-semibold">DIFFICULTY</p>
                  <p class="text-sm font-bold text-slate-900">{{ exercise.category === 'Strength' ? 'Advanced' : 'Intermediate' }}</p>
                </div>
              </div>

              <!-- Primary action: Open Exercise Details -->
              <div class="flex items-center justify-between gap-4">
                <div *ngIf="isExerciseCompleted(i)" class="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">✔ Completed</div>
                <button
                  [disabled]="isExerciseLocked(i)"
                  class="flex-1 py-3 px-4 rounded-lg font-bold transition bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  Open Exercise Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-8 flex gap-4">
          <button
            (click)="goBack()"
            class="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition">
            Back to Subscription
          </button>
          <button
            (click)="startWorkout()"
            [disabled]="!day()"
            [class]="'flex-1 px-6 py-3 font-bold rounded-lg transition ' +
              (day()
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed')">
            ✓ Start Workout
          </button>
        </div>
      </div>
    </div>
  `
})
export class DayExercisesComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);
  private programBrowseService = inject(ProgramBrowseService);
  private destroy$ = new Subject<void>();

  day = signal<ProgramDay | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const dayId = params.get('id');
        if (dayId) {
          // Load day exercises from API by day ID
          this.loadDayExercises(parseInt(dayId, 10));
        } else {
          // Fall back to navigation state (from subscriptions page)
          const navigation = this.router.getCurrentNavigation();
          if (navigation?.extras.state?.['day']) {
            this.day.set(navigation.extras.state['day']);
            this.isLoading.set(false);
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDayExercises(dayId: number) {
    this.isLoading.set(true);
    this.programBrowseService.getProgramDayExercises(dayId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dayData) => {
          this.day.set(dayData);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading day exercises:', err);
          this.isLoading.set(false);
        }
      });
  }

  calculateTotalSets(dayData: ProgramDay): number {
    if (!dayData.exercises) return 0;
    return dayData.exercises.reduce((total, exercise) => {
      return total + parseInt(exercise.sets || '0', 10);
    }, 0);
  }

  isExerciseCompleted(index: number): boolean {
    const session = this.workoutService.currentWorkoutSession();
    if (!session) return false;
    return !!session.exercises[index]?.completed;
  }

  isExerciseLocked(index: number): boolean {
    const session = this.workoutService.currentWorkoutSession();
    // If there's no session, exercises are not locked (user can start one)
    if (!session) return false;
    if (index === 0) return false;
    // Locked if previous exercise is not completed
    return !session.exercises[index - 1]?.completed;
  }

  onExecuteExercise(exerciseIndex: number) {
    const dayData = this.day();
    if (!dayData) return;

    // Start workout session with the day and jump to the selected exercise
    this.workoutService.startWorkout(dayData);

    // Set the current exercise index in the service and navigate to the exercise screen
    // `currentExerciseIndex` is a signal exposed by the service
    try {
      (this.workoutService as any).currentExerciseIndex.set(exerciseIndex);
    } catch (e) {
      // Fallback: if the signal shape changes, attempt assignment
      try {
        (this.workoutService as any).currentExerciseIndex = exerciseIndex;
      } catch {}
    }

    // Determine exerciseId to route to the execute page
    const exercise = dayData.exercises?.[exerciseIndex];
    const exerciseId = (exercise as any)?.exerciseId ?? (exercise as any)?.id ?? null;
    if (exerciseId) {
      this.router.navigate(['/workout/execute', exerciseId]);
    } else {
      this.router.navigate(['/workout/execute']);
    }
  }

  startWorkout() {
    const dayData = this.day();
    if (dayData) {
      this.workoutService.startWorkout(dayData);
      this.router.navigate(['/workout/day']);
    }
  }

  goBack() {
    this.router.navigate(['/subscriptions']);
  }
}
