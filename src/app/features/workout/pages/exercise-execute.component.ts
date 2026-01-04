import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { WorkoutSessionService } from '../services/workout-session.service';

@Component({
  selector: 'app-exercise-execute',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Navigation -->
        <button
          (click)="goBack()"
          class="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Workout Day
        </button>

        <!-- Exercise Card -->
        <div *ngIf="currentExercise() as exercise" class="bg-white rounded-lg shadow-lg p-8">
          <h1 class="text-4xl font-bold text-slate-900 mb-2">{{ exercise.excersiceName }}</h1>
          <p class="text-slate-600 mb-6">{{ exercise.muscleGroup }}</p>

          <!-- Exercise Image -->
          <div *ngIf="exercise.thumbnailUrl" class="mb-8 rounded-lg overflow-hidden bg-slate-100">
            <img
              [src]="exercise.thumbnailUrl"
              [alt]="exercise.excersiceName"
              class="w-full h-64 object-cover">
          </div>

          <!-- Exercise Details -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
            <div class="bg-slate-50 p-3 rounded">
              <p class="text-slate-600 text-xs font-semibold">SETS</p>
              <p class="text-2xl font-bold text-slate-900">{{ exercise.sets }}</p>
            </div>
            <div class="bg-slate-50 p-3 rounded">
              <p class="text-slate-600 text-xs font-semibold">REPS</p>
              <p class="text-2xl font-bold text-slate-900">{{ exercise.reps }}</p>
            </div>
            <div class="bg-slate-50 p-3 rounded">
              <p class="text-slate-600 text-xs font-semibold">EQUIPMENT</p>
              <p class="text-lg font-semibold text-slate-900">{{ exercise.equipment }}</p>
            </div>
            <div class="bg-slate-50 p-3 rounded">
              <p class="text-slate-600 text-xs font-semibold">REST</p>
              <p class="text-2xl font-bold text-slate-900">{{ exercise.restSeconds }}s</p>
            </div>
          </div>

          <!-- Notes -->
          <p *ngIf="exercise.notes" class="text-slate-700 bg-blue-50 p-4 rounded mb-8 border-l-4 border-blue-500">
            {{ exercise.notes }}
          </p>

          <!-- Sets Tracker -->
          <div class="mb-8">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Track Sets</h3>
            <div class="space-y-3">
              <div *ngFor="let setNum of getSetRange(); let i = index" class="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                <div class="font-semibold text-slate-900">Set {{ setNum }}</div>
                <div class="flex items-center gap-3">
                  <input
                    type="number"
                    [value]="repsPerSet()[i]"
                    (change)="updateReps(i, $event)"
                    placeholder="reps"
                    min="0"
                    class="w-16 px-3 py-2 border border-slate-300 rounded text-center font-semibold">
                  <span class="text-slate-600 text-sm">/ {{ exercise.reps }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Reps -->
          <div class="mb-8 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <p class="text-sm text-green-600 font-semibold">Total Reps Completed</p>
            <p class="text-3xl font-bold text-green-900">{{ totalRepsCompleted() }} / {{ getTotalTargetReps() }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4">
            <button
              (click)="goBack()"
              class="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition">
              Cancel
            </button>
            <button
              (click)="completeExercise()"
              [disabled]="!isExerciseValid()"
              [class]="'flex-1 px-6 py-3 font-bold rounded-lg transition ' +
                (isExerciseValid()
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed')">
              ✓ Complete Exercise
            </button>
          </div>
        </div>

        <!-- No Exercise Message -->
        <div *ngIf="!currentExercise()" class="bg-white rounded-lg shadow-lg p-8 text-center">
          <p class="text-slate-600">Exercise not found</p>
        </div>
      </div>
    </div>
  `
})
export class ExerciseExecuteComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sessionService = inject(WorkoutSessionService);

  private exerciseIdSignal = signal<number>(0);
  currentExercise = computed(() => {
    const id = this.exerciseIdSignal();
    return this.sessionService.getExerciseById(id);
  });

  repsPerSet = signal<number[]>([]);

  totalRepsCompleted = computed(() => {
    return this.repsPerSet().reduce((a, b) => a + b, 0);
  });

  ngOnInit(): void {
    const exerciseId = this.route.snapshot.paramMap.get('exerciseId');
    if (exerciseId) {
      this.exerciseIdSignal.set(parseInt(exerciseId, 10));
      const exercise = this.currentExercise();
      if (exercise?.sets) {
        this.repsPerSet.set(new Array(exercise.sets).fill(0));
      }
    }
  }

  getSetRange(): number[] {
    const exercise = this.currentExercise();
    return exercise?.sets ? Array.from({ length: exercise.sets }, (_, i) => i + 1) : [];
  }

  getTotalTargetReps(): number {
    const exercise = this.currentExercise();
    return exercise ? (exercise.sets || 0) * (exercise.reps || 0) : 0;
  }

  updateReps(setIndex: number, event: any): void {
    const newReps = parseInt(event.target.value, 10) || 0;
    const newArray = [...this.repsPerSet()];
    newArray[setIndex] = newReps;
    this.repsPerSet.set(newArray);
  }

  isExerciseValid(): boolean {
    const exercise = this.currentExercise();
    const reps = this.repsPerSet();
    if (!exercise || reps.length === 0) return false;
    return reps.some(r => r > 0);
  }

  completeExercise(): void {
    const exerciseId = this.exerciseIdSignal();
    const reps = this.repsPerSet();
    this.sessionService.completeExercise(exerciseId, reps);
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/workout/day']);
  }
}
