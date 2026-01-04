import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { WorkoutService } from '../services/workout.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-workout-exercise',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <button
              (click)="goBack()"
              class="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Day
            </button>
            <h1 class="text-3xl font-bold text-slate-900">
              {{ currentExercise()!.exercise.excersiceName }}
            </h1>
          </div>
          <div class="text-right">
            <p class="text-sm text-slate-600">Exercise {{ currentExerciseNumber() }} of {{ totalExercises() }}</p>
            <div class="w-32 h-2 bg-slate-200 rounded-full mt-2">
              <div
                [style.width.%]="(currentExerciseNumber() / totalExercises()) * 100"
                class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all">
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div *ngIf="currentExercise() as exercise" class="space-y-6">
          <!-- Exercise Image -->
          <div *ngIf="exercise.exercise.thumbnailUrl" class="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              [src]="exercise.exercise.thumbnailUrl"
              [alt]="exercise.exercise.excersiceName"
              class="w-full h-96 object-cover">
          </div>

          <!-- Exercise Info Card -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="border-l-4 border-blue-500 pl-4">
                <p class="text-xs font-semibold text-slate-600 uppercase">Muscle Group</p>
                <p class="text-lg font-bold text-slate-900">{{ exercise.exercise.muscleGroup }}</p>
              </div>
              <div class="border-l-4 border-purple-500 pl-4">
                <p class="text-xs font-semibold text-slate-600 uppercase">Equipment</p>
                <p class="text-lg font-bold text-slate-900">{{ exercise.exercise.equipment }}</p>
              </div>
              <div class="border-l-4 border-orange-500 pl-4">
                <p class="text-xs font-semibold text-slate-600 uppercase">Category</p>
                <p class="text-lg font-bold text-slate-900">{{ exercise.exercise.category }}</p>
              </div>
              <div class="border-l-4 border-green-500 pl-4">
                <p class="text-xs font-semibold text-slate-600 uppercase">Rest</p>
                <p class="text-lg font-bold text-slate-900">{{ exercise.exercise.restSeconds }}s</p>
              </div>
            </div>

            <p *ngIf="exercise.exercise.notes" class="text-slate-700 mb-4">
              <span class="font-semibold">Notes:</span> {{ exercise.exercise.notes }}
            </p>

            <!-- Target Reps Display -->
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p class="text-sm text-blue-600 font-semibold">TARGET</p>
              <p class="text-3xl font-bold text-blue-900">{{ exercise.exercise.reps }} reps</p>
            </div>
          </div>

          <!-- Sets Tracking -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              Sets: {{ exercise.totalSetsCompleted }}/{{ exercise.sets.length }} Completed
            </h2>

            <div class="space-y-4">
              <div
                *ngFor="let set of exercise.sets; let i = index"
                [class]="'border-2 rounded-lg p-4 transition ' +
                  (set.completed
                    ? 'bg-green-50 border-green-500'
                    : 'bg-slate-50 border-slate-200')">
                <!-- Set Header -->
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-xl font-bold text-slate-900">Set {{ set.setNumber }}</h3>
                    <p class="text-sm text-slate-600">Target: {{ set.targetReps }} reps</p>
                  </div>
                  <div *ngIf="set.completed" class="text-green-600 text-2xl font-bold">
                    ✓
                  </div>
                </div>

                <!-- Input Fields / Counter -->
                <div *ngIf="!set.completed" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-2">Choose Target Reps</label>
                      <div class="flex gap-2 flex-wrap">
                        <button *ngFor="let r of repOptionsForSet(i)"
                                (click)="chooseReps(r)"
                                [class]="'px-3 py-1 rounded-full border ' + (selectedReps() === r ? 'bg-blue-600 text-white' : 'bg-white text-slate-700')">
                          {{ r }}
                        </button>
                      </div>

                      <div class="mt-4">
                        <button (click)="startCounter()"
                                [disabled]="!selectedReps()"
                                class="px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white disabled:opacity-50">
                          Start Counter
                        </button>
                      </div>

                      <div *ngIf="counterActive() && remainingReps() !== null" class="mt-6">
                        <div class="w-full flex justify-center">
                          <button (click)="tapCounter()" class="w-56 h-56 rounded-full bg-black text-white text-6xl font-bold flex items-center justify-center">
                            {{ remainingReps() }}
                          </button>
                        </div>
                        <p class="text-center text-sm text-slate-600 mt-3">Tap the circle each time you complete a rep</p>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-2">Weight (optional)</label>
                      <input
                        type="number"
                        [(ngModel)]="set.weight"
                        step="0.5"
                        min="0"
                        placeholder="Enter weight"
                        class="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-bold">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Notes (optional)</label>
                    <input
                      type="text"
                      [(ngModel)]="set.notes"
                      placeholder="Add notes about this set..."
                      class="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500">
                  </div>

                  <div class="mt-2">
                    <p class="text-sm text-slate-500 mb-2">Or finish set manually:</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input type="number" [(ngModel)]="set.actualReps" min="0" class="px-4 py-2 border rounded" placeholder="Reps completed">
                      <button
                        (click)="completeSet(i)"
                        [disabled]="set.actualReps <= 0"
                        class="w-full py-3 px-4 rounded-lg font-bold transition bg-gradient-to-r from-green-500 to-emerald-500 text-white disabled:opacity-50">
                        ✓ Complete Set {{ set.setNumber }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Completed Set Display -->
                <div *ngIf="set.completed" class="space-y-2">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white border-l-4 border-green-500 pl-4 py-2">
                      <p class="text-xs text-slate-600 font-semibold">Reps</p>
                      <p class="text-2xl font-bold text-slate-900">{{ set.actualReps }}</p>
                    </div>
                    <div *ngIf="set.weight" class="bg-white border-l-4 border-blue-500 pl-4 py-2">
                      <p class="text-xs text-slate-600 font-semibold">Weight</p>
                      <p class="text-2xl font-bold text-slate-900">{{ set.weight }} lbs</p>
                    </div>
                  </div>
                  <p *ngIf="set.notes" class="text-sm text-slate-600">{{ set.notes }}</p>
                </div>
              </div>
            </div>

            <!-- Rest Timer Info -->
            <div *ngIf="hasIncompleteSets()" class="mt-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <p class="text-orange-900">
                <span class="font-semibold">Remember:</span> Rest for {{ currentExercise()!.exercise.restSeconds }} seconds between sets.
              </p>
            </div>
          </div>

          <!-- Navigation & Completion -->
          <div class="flex gap-4">
            <button
              (click)="previousExercise()"
              [disabled]="!canGoPrevious()"
              [class]="'flex-1 py-3 px-4 rounded-lg font-bold transition ' +
                (canGoPrevious()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed')">
              ← Previous
            </button>
            <button
              (click)="nextExercise()"
              [disabled]="!isAllSetsDone() || !canGoNext()"
              [class]="'flex-1 py-3 px-4 rounded-lg font-bold transition ' +
                (isAllSetsDone() && canGoNext()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed')">
              Next →
            </button>
            <button
              (click)="finishExercise()"
              [disabled]="!isAllSetsDone()"
              [class]="'flex-1 py-3 px-4 rounded-lg font-bold transition ' +
                (isAllSetsDone()
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed')">
              Finish Exercise
            </button>
          </div>

          <div class="mt-4">
            <button
              class="execute-btn px-4 py-3 rounded-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              (click)="executeExercise()">
              Execute Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WorkoutExerciseComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private destroy$ = new Subject<void>();

  // Counter state
  selectedReps = signal<number | null>(null);
  remainingReps = signal<number | null>(null);
  counterActive = signal(false);

  // Computed signals for template
  hasIncompleteSets = computed(() => {
    const exercise = this.currentExercise();
    if (!exercise) return false;
    return exercise.sets.some((s: any) => !s.completed);
  });

  ngOnInit() {
    // Component receives currentExerciseIndex from service
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  currentExercise() {
    return this.workoutService.getCurrentExercise();
  }

  // Index of first incomplete set inside the current exercise
  activeSetIndex(): number {
    const ex = this.currentExercise();
    if (!ex) return -1;
    const idx = ex.sets.findIndex((s: any) => !s.completed);
    return idx === -1 ? -1 : idx;
  }

  // Parse rep range string like "6-8" or "20x" or "12"
  repOptionsForSet(setIndex: number): number[] {
    const ex = this.currentExercise();
    if (!ex) return [];
    const target = ex.sets[setIndex]?.targetReps || '';
    const cleaned = target.replace(/x/gi, '').trim();
    if (!cleaned) return [];
    const rangeMatch = cleaned.match(/(\d+)\s*-\s*(\d+)/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1], 10);
      const max = parseInt(rangeMatch[2], 10);
      const opts: number[] = [];
      for (let i = min; i <= max; i++) opts.push(i);
      return opts;
    }
    const single = parseInt(cleaned, 10);
    if (!isNaN(single)) return [single];
    return [];
  }

  chooseReps(n: number) {
    this.selectedReps.set(n);
    this.remainingReps.set(n);
  }

  startCounter() {
    const current = this.remainingReps();
    if (current && current > 0) {
      this.counterActive.set(true);
    }
  }

  tapCounter() {
    const r = this.remainingReps();
    if (r === null) return;
    if (r > 1) {
      this.remainingReps.set(r - 1);
    } else {
      // reached zero -> complete set
      this.remainingReps.set(0);
      this.counterActive.set(false);
      this.autoCompleteCurrentSet();
    }
  }

  private autoCompleteCurrentSet() {
    const exerciseIndex = this.workoutService.currentExerciseIndex();
    const setIndex = this.activeSetIndex();
    if (setIndex < 0) return;
    const reps = this.selectedReps() ?? 0;
    // Apply reps to set and mark completed
    this.workoutService.completeSet(exerciseIndex, setIndex, reps, undefined);

    // After completing, check if exercise completed -> move to next or finish
    const currEx = this.workoutService.getCurrentExercise();
    if (currEx && currEx.completed) {
      const moved = this.workoutService.moveToNextExercise();
      if (!moved) {
        // Finished all exercises: end and submit session
        const session = this.workoutService.endWorkout();
        if (session) {
          this.workoutService.submitWorkoutSession().subscribe({
            next: () => {
              // navigate back to day or show summary
              this.router.navigate(['/workout/day']);
            },
            error: () => {
              this.router.navigate(['/workout/day']);
            }
          });
        }
      }
    } else {
      // Stay on same exercise, next set will be active
    }
    // reset counter state
    this.selectedReps.set(null);
    this.remainingReps.set(null);
    this.counterActive.set(false);
  }

  currentExerciseNumber() {
    return this.workoutService.currentExerciseIndex() + 1;
  }

  totalExercises() {
    return this.workoutService.currentWorkoutSession()?.exercises.length || 0;
  }

  completeSet(setIndex: number): void {
    const exerciseIndex = this.workoutService.currentExerciseIndex();
    const exercise = this.currentExercise();
    if (exercise && setIndex >= 0 && setIndex < exercise.sets.length) {
      const set = exercise.sets[setIndex];
      this.workoutService.completeSet(exerciseIndex, setIndex, set.actualReps, set.weight);
    }
  }

  isAllSetsDone(): boolean {
    const exercise = this.currentExercise();
    if (!exercise) return false;
    return exercise.sets.every((s: any) => s.completed);
  }

  canGoNext(): boolean {
    return this.workoutService.currentExerciseIndex() + 1 < this.totalExercises();
  }

  canGoPrevious(): boolean {
    return this.workoutService.currentExerciseIndex() > 0;
  }

  nextExercise(): void {
    if (this.canGoNext()) {
      this.workoutService.moveToNextExercise();
    }
  }

  previousExercise(): void {
    if (this.canGoPrevious()) {
      this.workoutService.moveToPreviousExercise();
    }
  }

  finishExercise(): void {
    // Go back to day view
    this.router.navigate(['/workout/day']);
  }

  goBack(): void {
    this.router.navigate(['/workout/day']);
  }

  executeExercise(): void {
    const ex = this.currentExercise();
    if (!ex) return;
    const id = (ex.exercise as any)?.exerciseId ?? (ex.exercise as any)?.id ?? null;
    if (id) {
      this.router.navigate(['/workout/execute', id]);
    } else {
      this.router.navigate(['/workout/day']);
    }
  }
}
