import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgramService, ProgramDay, Exercise } from '../../services/program.service';
import { WorkoutStateService } from '../../../workout/services/workout-state.service';
import { WorkoutHistoryService } from '../../../workout/services/workout-history.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-program-day-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-5xl mx-auto">
        <!-- Navigation -->
        <div class="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <button
            (click)="goToPrograms()"
            class="text-sky-600 hover:text-sky-700 font-medium">
            Programs
          </button>
          <span>/</span>
          <button
            (click)="goToDetail()"
            class="text-sky-600 hover:text-sky-700 font-medium">
            Days
          </button>
          <span>/</span>
          <span class="text-gray-900 font-semibold">{{ day()?.title }}</span>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex justify-center items-center min-h-96">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        }

        <!-- Content -->
        @else if (day()) {
          <div class="space-y-6">
            <!-- Day Header -->
            <div class="bg-gradient-to-r from-sky-600 to-sky-700 rounded-lg shadow-lg p-8 text-white relative">
              <!-- Completion Badge -->
              @if (isDayCompleted()) {
                <div class="absolute top-4 right-4 bg-green-500 text-white rounded-full p-3 flex items-center gap-2">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="font-semibold">Completed</span>
                </div>
              }

              <h1 class="text-4xl font-bold mb-2">{{ day()?.title }}</h1>
              <div class="flex items-center gap-4 mt-4">
                <span class="bg-white bg-opacity-30 px-4 py-2 rounded-full font-semibold">
                  Day {{ day()?.dayNumber }}
                </span>
                <span class="bg-white bg-opacity-30 px-4 py-2 rounded-full font-semibold">
                  {{ exercises().length }} Exercises
                </span>
              </div>
              @if (day()?.notes) {
                <p class="mt-4 text-blue-100">{{ day()?.notes }}</p>
              }
            </div>

            <!-- Exercises List -->
            <div class="space-y-4">
              @for (exercise of exercises(); track exercise.exerciseId) {
                <div [class.opacity-60]="isExerciseCompleted(exercise.exerciseId)" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer relative" (click)="startExerciseExecution(exercise.exerciseId)">
                  <!-- Completion Badge -->
                  @if (isExerciseCompleted(exercise.exerciseId)) {
                    <div class="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 z-10">
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  }

                  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                    <!-- Exercise Info & Image -->
                    <div class="md:col-span-2">
                      <div class="flex gap-4">
                        <!-- Thumbnail -->
                        @if (exercise.thumbnailUrl) {
                          <div class="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img [src]="exercise.thumbnailUrl"
                                 [alt]="exercise.excersiceName"
                                 class="w-full h-full object-cover">
                          </div>
                        }

                        <!-- Details -->
                        <div class="flex-1">
                          <div class="flex items-start justify-between mb-2">
                            <div>
                              <h3 class="text-xl font-bold text-gray-900">
                                {{ exercise.orderIndex }}. {{ exercise.excersiceName }}
                              </h3>
                              <p class="text-sm text-gray-600">{{ exercise.category }}</p>
                            </div>
                          </div>

                          <!-- Exercise Type Badges -->
                          <div class="flex gap-2 mt-2 flex-wrap">
                            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                              {{ exercise.muscleGroup }}
                            </span>
                            <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                              {{ exercise.equipment }}
                            </span>
                          </div>

                          <!-- Notes -->
                          @if (exercise.notes) {
                            <p class="text-sm text-gray-700 mt-2 italic">{{ exercise.notes }}</p>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Workout Parameters -->
                    <div>
                      <div class="space-y-3">
                        <div class="bg-gray-50 p-3 rounded-lg">
                          <p class="text-xs text-gray-600 uppercase font-semibold">Sets</p>
                          <p class="text-2xl font-bold text-sky-600">{{ exercise.sets }}</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                          <p class="text-xs text-gray-600 uppercase font-semibold">Reps</p>
                          <p class="text-2xl font-bold text-sky-600">{{ exercise.reps }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Rest & Additional Info -->
                    <div>
                      <div class="space-y-3">
                        <div class="bg-gray-50 p-3 rounded-lg">
                          <p class="text-xs text-gray-600 uppercase font-semibold">Rest</p>
                          <p class="text-2xl font-bold text-sky-600">{{ exercise.restSeconds }}s</p>
                        </div>

                        <!-- Additional Parameters -->
                        @if (exercise.tempo || exercise.rpe || exercise.percent1RM) {
                          <div class="bg-amber-50 p-3 rounded-lg">
                            @if (exercise.tempo) {
                              <p class="text-xs text-gray-600 uppercase font-semibold">Tempo</p>
                              <p class="text-lg font-bold text-amber-700">{{ exercise.tempo }}</p>
                            }
                            @if (exercise.rpe) {
                              <p class="text-xs text-gray-600 uppercase font-semibold">RPE</p>
                              <p class="text-lg font-bold text-amber-700">{{ exercise.rpe }}</p>
                            }
                            @if (exercise.percent1RM) {
                              <p class="text-xs text-gray-600 uppercase font-semibold">% 1RM</p>
                              <p class="text-lg font-bold text-amber-700">{{ exercise.percent1RM }}</p>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 mt-8">
              <button
                (click)="goToDetail()"
                class="flex-1 border-2 border-sky-600 text-sky-600 font-semibold py-3 px-4 rounded-lg hover:bg-sky-50 transition">
                Back to Days
              </button>
              <button
                (click)="startWorkout()"
                [disabled]="isDayCompleted()"
                [class.opacity-50]="isDayCompleted()"
                [class.cursor-not-allowed]="isDayCompleted()"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition">
                {{ isDayCompleted() ? '✓ Already Completed' : 'Start Workout' }}
              </button>
            </div>
          </div>
        }

        <!-- Empty State -->
        @else if (!isLoading() && !day()) {
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.248 6.253 2 10.541 2 15.5S6.248 24.747 12 24.747s10-4.288 10-9.247S17.752 6.253 12 6.253z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900">Day Not Found</h3>
            <p class="text-gray-500 mt-2">This training day could not be loaded</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class ProgramDayDetailComponent implements OnInit {
  private programService = inject(ProgramService);
  private workoutStateService = inject(WorkoutStateService);
  private workoutHistoryService = inject(WorkoutHistoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  day = signal<ProgramDay | null>(null);
  exercises = signal<Exercise[]>([]);
  isLoading = signal(false);
  programId!: number;
  dayId!: number;

  // Computed signal to track completed exercises in current session
  completedExerciseIds = computed(() => {
    const session = this.workoutStateService.session();
    if (!session || !session.completedExerciseIds) {
      return [];
    }
    return session.completedExerciseIds;
  });

  // Check if day is completed from workout history
  isDayCompleted = computed(() => {
    return this.workoutHistoryService.isDayCompleted(this.dayId);
  });

  isExerciseCompleted = (exerciseId: number) => {
    return this.completedExerciseIds().includes(exerciseId);
  };

  ngOnInit() {
    // Get day data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const dayFromState = (navigation?.extras?.state as any)?.day;

    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.programId = parseInt(params['programId'], 10);
      this.dayId = parseInt(params['dayId'], 10);
      console.log('Day detail loaded - programId:', this.programId, 'dayId:', this.dayId);
      // Use data from state navigation when available
      if (dayFromState) {
        console.log('Day data from state:', dayFromState);
        this.day.set(dayFromState);
        this.exercises.set(dayFromState.exercises || []);
        this.isLoading.set(false);
        return;
      }

      // No navigation state — fetch day details from backend
      this.isLoading.set(true);
      this.programService.getExercisesByDayId(this.dayId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (dayData: ProgramDay) => {
            console.log('Loaded day from API:', dayData);
            this.day.set(dayData);
            this.exercises.set(dayData.exercises || []);
            this.isLoading.set(false);
          },
          error: (err: unknown) => {
            console.error('Error loading day from API:', err);
            this.day.set(null);
            this.exercises.set([]);
            this.isLoading.set(false);
          }
        });
    });
  }

  // Data comes from selected day in parent component, no API call needed

  startWorkout() {
    const exercisesData = this.exercises().map((ex: any) => ({
      id: ex.exerciseId ?? ex.id,
      sets: Number(ex.sets),
      reps: ex.reps
    }));

    console.log('🏋️ STARTING WORKOUT');
    console.log(`📋 Total Exercises: ${exercisesData.length}`);
    console.log('Exercises:', exercisesData);

    // Initialize workout session with all exercises
    this.workoutStateService.initializeWorkout(this.dayId, exercisesData);

    console.log(`✅ Workout initialized for Day ID: ${this.dayId}`);
    console.log(`🎯 Starting with first exercise...`);

    // Navigate to the first exercise
    if (exercisesData.length > 0) {
      const firstExerciseId = exercisesData[0].id;
      console.log(`➡️ Navigating to Exercise 1 (ID: ${firstExerciseId})`);
      this.router.navigate(['/exercise', firstExerciseId, 'execute'], {
        queryParams: { dayId: this.dayId, programId: this.programId }
      });
    }
  }

  startExerciseExecution(exerciseId: number) {
    // Navigate to exercise execution page with dayId and programId as query params
    this.router.navigate(['/exercise', exerciseId, 'execute'], {
      queryParams: { dayId: this.dayId, programId: this.programId }
    });
  }

  goToDetail() {
    this.router.navigate(['/programs', this.programId]);
  }

  goToPrograms() {
    this.router.navigate(['/programs']);
  }
}
