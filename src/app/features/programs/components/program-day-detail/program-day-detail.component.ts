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
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Back Button & Header -->
        <div class="mb-8">
          <button
            (click)="goToDetail()"
            class="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold mb-6 group transition"
          >
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Days
          </button>
          <div>
            <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {{ day()?.title }}
            </h1>
            <p class="text-gray-600 text-lg">Day {{ day()?.dayNumber }} • {{ exercises().length }} Exercises</p>
          </div>
        </div>

        <!-- Start Workout Progress Modal -->
        @if (showStartWorkoutModal()) {
          <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn p-4">
            <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
              <!-- Modal Header -->
              <div class="bg-gradient-to-r from-sky-600 to-indigo-600 px-8 py-6 text-white">
                <h2 class="text-3xl font-bold mb-2">Workout Progress</h2>
                <p class="text-sky-100">{{ completedCount() }} of {{ exercises().length }} exercises completed</p>
              </div>

              <!-- Modal Content -->
              <div class="p-8">
                <!-- Completion Summary -->
                <div class="mb-8">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-gray-900">Progress</h3>
                    <span class="text-3xl font-bold text-orange-600">{{ (completedCount() / exercises().length * 100 | number:'1.0-0') || 0 }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all" [style.width.%]="(completedCount() / exercises().length * 100 || 0)"></div>
                  </div>
                </div>

                <!-- Completed Exercises -->
                @if (completedExercisesForDay().length > 0) {
                  <div class="mb-8">
                    <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Completed Exercises
                    </h3>
                    <div class="space-y-2">
                      @for (exercise of getCompletedExercises(); track exercise.exerciseId) {
                        <div class="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
                          <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                          <span class="text-gray-900 font-semibold">{{ exercise.excersiceName }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Next Exercise -->
                @if (nextExerciseToExecute(); as next) {
                  <div class="mb-8">
                    <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      Next Exercise
                    </h3>
                    <div class="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                      <p class="text-blue-900 font-bold text-lg">{{ next.excersiceName }}</p>
                      <p class="text-blue-700 text-sm mt-1">
                        {{ getExerciseIndex(next.exerciseId) }} of {{ exercises().length }}
                      </p>
                    </div>
                  </div>
                } @else {
                  <div class="mb-8 bg-green-50 border-2 border-green-400 rounded-lg p-4">
                    <p class="text-green-900 font-bold text-lg">✓ Workout already completed!</p>
                  </div>
                }

                <!-- Remaining Exercises -->
                @if (getRemainingExercises().length > 0) {
                  <div class="mb-8">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Remaining Exercises ({{ getRemainingExercises().length }})</h3>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                      @for (exercise of getRemainingExercises(); track exercise.exerciseId) {
                        <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span class="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold text-sm">{{ getExerciseIndex(exercise.exerciseId) }}</span>
                          <span class="text-gray-700">{{ exercise.excersiceName }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Modal Footer -->
              <div class="bg-gray-50 px-8 py-4 border-t border-gray-200 flex gap-3">
                <button
                  (click)="cancelStartWorkout()"
                  class="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                @if (nextExerciseToExecute()) {
                  <button
                    (click)="proceedWithWorkout()"
                    class="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition shadow-lg"
                  >
                    Continue Workout
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- Resume Workout Modal (Legacy - kept for backward compatibility) -->
        @if (showResumeModal()) {
          <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
            <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-slideUp">
              <div class="text-center mb-6">
                <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-3">Resume Workout?</h2>
                <p class="text-gray-600 text-lg mb-2">
                  You've completed <span class="font-bold text-green-600">{{ completedCount() }}</span> of {{ exercises().length }} exercises
                </p>
                <p class="text-gray-500 mb-4">
                  Next: <span class="font-semibold text-sky-600">{{ getNextExerciseName() }}</span>
                </p>
                <div class="bg-sky-50 rounded-lg p-4 mb-6">
                  <p class="text-sky-800 font-semibold">Starting in {{ resumeCountdown() }} seconds...</p>
                </div>
              </div>
              <div class="flex gap-3">
                <button
                  (click)="cancelResume()"
                  class="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  (click)="continueWorkout()"
                  class="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition shadow-lg"
                >
                  Continue Now
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex items-center justify-center py-20">
          <div class="relative">
            <div class="w-20 h-20 border-4 border-sky-200 rounded-full"></div>
            <div class="w-20 h-20 border-4 border-sky-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>

        <!-- Content -->
        <div *ngIf="!isLoading() && day()">
          <!-- Day Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Completion Status -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-2">Status</p>
                  <p class="text-3xl font-bold" [class.text-green-600]="isDayCompleted()" [class.text-sky-600]="!isDayCompleted()">
                    {{ isDayCompleted() ? '✓ Completed' : 'Ready' }}
                  </p>
                </div>
                <div [class]="isDayCompleted() ? 'bg-green-100' : 'bg-sky-100'" class="rounded-full p-4">
                  <svg [class]="isDayCompleted() ? 'text-green-600' : 'text-sky-600'" class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Exercise Count -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <p class="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-2">Total Exercises</p>
              <p class="text-4xl font-bold text-purple-600 mb-2">{{ exercises().length }}</p>
              <p class="text-gray-500 text-sm">{{ completedCount() }} completed</p>
            </div>

            <!-- Completion Rate -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <p class="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-2">Progress</p>
              <p class="text-4xl font-bold text-orange-600 mb-2">{{ (completedCount() / exercises().length * 100 | number:'1.0-0') || 0 }}%</p>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all" [style.width.%]="(completedCount() / exercises().length * 100 || 0)"></div>
              </div>
            </div>
          </div>

          <!-- Start Workout Button -->
          <div class="flex justify-center my-8">
            <button
              (click)="startWorkout()"
              [disabled]="isDayCompleted()"
              class="bg-gradient-to-r from-green-600 to-green-700
                     hover:from-green-700 hover:to-green-800
                     text-white font-bold text-lg
                     py-5 px-12 rounded-2xl
                     shadow-xl hover:scale-105 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 {{ isDayCompleted() ? 'Workout Completed' : (completedCount() > 0 ? 'Resume Workout' : 'Start Workout') }}
            </button>
          </div>

          <!-- Exercises Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (exercise of exercises(); track exercise.exerciseId; let i = $index) {
              <div
                (click)="startExerciseExecution(exercise.exerciseId)"
                [class.ring-2]="isExerciseCompleted(exercise.exerciseId)"
                [class.ring-green-500]="isExerciseCompleted(exercise.exerciseId)"
                [class.opacity-50]="isDayCompleted()"
                [class.cursor-not-allowed]="isDayCompleted()"
                [class.pointer-events-none]="isDayCompleted()"
                class="group bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-100 flex flex-col relative"
                [style.backgroundImage]="exercise.thumbnailUrl ? 'url(' + exercise.thumbnailUrl + ')' : 'none'"
                [style.backgroundSize]="'cover'"
                [style.backgroundPosition]="'center'"
              >
                <!-- Dark Overlay -->
                @if (exercise.thumbnailUrl) {
                  <div class="absolute inset-0 bg-black/50"></div>
                }

                <!-- Content -->
                <div class="relative z-10 flex flex-col h-full">
                  <div class="bg-gradient-to-r from-red-500 to-red-600 px-3 py-3 text-white flex flex-col">
                    <div class="flex items-start justify-between mb-2">
                      <h3 class="text-lg font-bold leading-tight flex-1">{{ exercise.excersiceName }}</h3>
                      @if (isExerciseCompleted(exercise.exerciseId)) {
                        <div class="bg-green-500 text-white rounded-full p-2 flex-shrink-0 ml-2">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      }
                    </div>

                    <p class="text-red-100 text-lg italic mb-3 font-semibold">{{ getMotivationalMessage(exercise.exerciseId) }}</p>

                    <div class="flex gap-2">
                      <div class="bg-blue-500/40 rounded p-1 border border-blue-300 text-center flex-1">
                        <p class="text-blue-200 text-xs font-bold">Sets</p>
                        <p class="text-xs font-bold text-blue-100">{{ exercise.sets }}</p>
                      </div>
                      <div class="bg-blue-500/40 rounded p-1 border border-blue-300 text-center flex-1">
                        <p class="text-green-200 text-xs font-bold">Reps</p>
                        <p class="text-xs font-bold text-green-100">{{ exercise.reps }}</p>
                      </div>
                      <div class="bg-blue-500/40 rounded p-1 border border-blue-300 text-center flex-1">
                        <p class="text-orange-200 text-xs font-bold">Rest</p>
                        <p class="text-xs font-bold text-orange-100">{{ exercise.restSeconds }}s</p>
                      </div>
                    </div>
                  </div>

                  <div class="px-4 py-6 flex-1">
                    @if (exercise.equipment) {
                      <span class="inline-block bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-xs font-semibold">
                        {{ exercise.equipment }}
                      </span>
                    }
                  </div>

                  <div class="bg-gray-50 px-4 py-2 border-t border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-700 group-hover:bg-sky-50 group-hover:text-sky-600 transition">
                    <span class="truncate">{{ i + 1 }}. {{ exercise.excersiceName }}</span>
                    <svg class="w-4 h-4 group-hover:translate-x-1 transition flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Action Buttons -->
          <div class="mt-8 flex gap-4">
            <button
              (click)="goToDetail()"
              class="flex-1 border-2 border-sky-600 text-sky-600 font-semibold py-4 px-6 rounded-xl hover:bg-sky-50 transition-all flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Days
            </button>
          </div>
        </div>
      </div>
    </div>

    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease;
      }

      .animate-slideUp {
        animation: slideUp 0.4s ease;
      }
    </style>
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

  // Modals
  showResumeModal = signal(false);
  showStartWorkoutModal = signal(false);
  resumeCountdown = signal(10);
  private resumeTimerInterval: any;

  private motivationalMessages = [
    'One more rep = one step stronger 💪',
    'Focus. Breathe. Lift 🔥',
    'Your future body is built here 🚀',
    'Strength is earned, not given 💪',
    'Small effort today, big results tomorrow',
    'Every rep counts 💯',
    'Push harder, you\'ve got this 🔥',
    'Consistency creates champions 🏆',
    'Feel the burn, embrace the gain 💪',
    'One day at a time, one rep at a time 🚀'
  ];

  /**
   * Get completed exercise IDs from:
   * 1. Active workout session (if exists)
   * 2. localStorage (persistent, survives reload)
   */
  completedExerciseIds = computed(() => {
    // First check if there's an active session with completed exercises
    const session = this.workoutStateService.session();
    if (session && session.completedExerciseIds && session.completedExerciseIds.length > 0) {
      return session.completedExerciseIds;
    }

    // Fall back to reading from localStorage (survives page reload)
    const storageKey = `workout_day_${this.dayId}`;
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const workoutData = JSON.parse(savedData);
        if (workoutData.completedExercises && Array.isArray(workoutData.completedExercises)) {
          return workoutData.completedExercises;
        }
      } catch (e) {
        console.warn('Failed to parse completed exercises from localStorage:', e);
      }
    }

    return [];
  });

  /**
   * Computed: Get completed exercises for the day
   */
  completedExercisesForDay = computed(() => {
    const completedIds = this.completedExerciseIds();
    return this.exercises().filter(ex => completedIds.includes(ex.exerciseId));
  });

  /**
   * Computed: Get the next exercise to execute
   */
  nextExerciseToExecute = computed(() => {
    const completed = this.completedExerciseIds();
    const next = this.exercises().find(ex => !completed.includes(ex.exerciseId));
    return next || null;
  });

  completedCount = computed(() => {
    return this.completedExerciseIds().length;
  });

  isDayCompleted = computed(() => {
    return this.workoutHistoryService.isDayCompleted(this.dayId);
  });

  isWorkoutLocked = computed(() => {
    const dayCompleted = this.isDayCompleted();
    const sessionStarted = !!this.workoutStateService.session();
    return !dayCompleted && !sessionStarted;
  });

  isExerciseCompleted = (exerciseId: number) => {
    const completed = this.completedExerciseIds();
    const inSession = completed.includes(exerciseId);
    const dayCompleted = this.isDayCompleted();
    return inSession || dayCompleted;
  };

  getMotivationalMessage = (exerciseId: number): string => {
    const index = exerciseId % this.motivationalMessages.length;
    return this.motivationalMessages[index];
  };

  getNextExerciseName(): string {
    const nextEx = this.nextExerciseToExecute();
    return nextEx?.excersiceName || 'Next Exercise';
  }

  /**
   * Get completed exercises list for modal
   */
  getCompletedExercises(): Exercise[] {
    return this.completedExercisesForDay();
  }

  /**
   * Get remaining (not completed) exercises list for modal
   */
  getRemainingExercises(): Exercise[] {
    const completed = this.completedExerciseIds();
    return this.exercises().filter(ex => !completed.includes(ex.exerciseId));
  }

  /**
   * Get the index (position) of an exercise in the exercises list
   */
  getExerciseIndex(exerciseId: number): number {
    const index = this.exercises().findIndex(ex => ex.exerciseId === exerciseId);
    return index >= 0 ? index + 1 : 0;
  }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const dayFromState = (navigation?.extras?.state as any)?.day;

    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.programId = parseInt(params['programId'], 10);
      this.dayId = parseInt(params['dayId'], 10);

      if (dayFromState) {
        this.day.set(dayFromState);
        this.exercises.set(dayFromState.exercises || []);
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);
      this.programService.getExercisesByDayId(this.dayId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (dayData: ProgramDay) => {
            this.day.set(dayData);
            this.exercises.set(dayData.exercises || []);
            this.isLoading.set(false);
          },
          error: (err: unknown) => {
            console.error('Error loading day:', err);
            this.day.set(null);
            this.exercises.set([]);
            this.isLoading.set(false);
          }
        });
    });
  }

  startWorkout() {
    // Show the progress modal
    this.showStartWorkoutModal.set(true);
  }

  /**
   * Called when user clicks "Continue Workout" in the modal
   */
  proceedWithWorkout() {
    const exercisesData = this.exercises().map((ex: any) => ({
      id: ex.exerciseId ?? ex.id,
      sets: Number(ex.sets),
      reps: ex.reps
    }));

    const completedIds = this.completedExerciseIds();

    // Initialize the workout session with all exercises (in case user starts from scratch)
    // This will include completedExerciseIds in the session
    this.workoutStateService.initializeWorkout(this.dayId, exercisesData, completedIds);

    // Get the next exercise to execute
    const nextExercise = this.nextExerciseToExecute();
    if (nextExercise) {
      // Close modal and navigate to next exercise
      this.showStartWorkoutModal.set(false);
      this.router.navigate(['/exercise', nextExercise.exerciseId, 'execute'], {
        queryParams: { dayId: this.dayId, programId: this.programId }
      });
    }
  }

  cancelStartWorkout() {
    this.showStartWorkoutModal.set(false);
  }

  private startResumeCountdown() {
    this.resumeCountdown.set(10);
    this.resumeTimerInterval = setInterval(() => {
      const current = this.resumeCountdown();
      if (current <= 1) {
        this.clearResumeTimer();
        this.continueWorkout();
      } else {
        this.resumeCountdown.set(current - 1);
      }
    }, 1000);
  }

  private clearResumeTimer() {
    if (this.resumeTimerInterval) {
      clearInterval(this.resumeTimerInterval);
      this.resumeTimerInterval = null;
    }
  }

  continueWorkout() {
    this.clearResumeTimer();
    this.showResumeModal.set(false);

    const completedIds = this.completedExerciseIds();
    const nextExercise = this.exercises().find(ex => !completedIds.includes(ex.exerciseId));

    if (nextExercise) {
      this.router.navigate(['/exercise', nextExercise.exerciseId, 'execute'], {
        queryParams: { dayId: this.dayId, programId: this.programId }
      });
    }
  }

  cancelResume() {
    this.clearResumeTimer();
    this.showResumeModal.set(false);
  }

  startExerciseExecution(exerciseId: number) {
    if (this.isWorkoutLocked()) {
      console.warn('⛔ Workout locked: Start workout first');
      return;
    }
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

  ngOnDestroy() {
    this.clearResumeTimer();
  }
}
