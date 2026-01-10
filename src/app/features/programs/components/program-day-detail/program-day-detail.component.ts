import { Component, OnInit, OnDestroy, inject, signal, computed, DestroyRef } from '@angular/core';
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
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-3 sm:px-4 md:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Back Button & Header -->
        <div class="mb-8">
          <button
            (click)="goToDetail()"
            class="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold mb-6 group transition-all duration-200 active:scale-95"
          >
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Days
          </button>
          <div>
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {{ day()?.title }}
            </h1>
            <p class="text-gray-600 text-sm sm:text-base md:text-lg">Day {{ day()?.dayNumber }} • {{ exercises().length }} Exercises</p>
          </div>
        </div>

        <!-- Start Workout Progress Modal -->
        @if (showStartWorkoutModal()) {
          <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn p-4">
            <div class="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-slideUp max-h-[70vh] overflow-y-auto border border-gray-100">
              <!-- Modal Header -->
              <div class="bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 text-white sticky top-0 z-10">
                <h2 class="text-xl font-bold mb-1">Workout Progress</h2>
                <p class="text-sky-100 text-sm">{{ completedCount() }} of {{ exercises().length }} exercises completed</p>
              </div>

              <!-- Modal Content -->
              <div class="p-6 space-y-5">
                <!-- Completion Summary -->
                <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-bold text-gray-900">Overall Progress</h3>
                    <span class="text-2xl font-bold text-orange-600">{{ (completedCount() / exercises().length * 100 | number:'1.0-0') || 0 }}%</span>
                  </div>
                  <div class="w-full bg-orange-200 rounded-full h-3">
                    <div class="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500" [style.width.%]="(completedCount() / exercises().length * 100 || 0)"></div>
                  </div>
                </div>

                <!-- Completed Exercises -->
                @if (completedExercisesForDay().length > 0) {
                  <div>
                    <h3 class="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Completed
                    </h3>
                    <div class="space-y-2">
                      @for (exercise of getCompletedExercises(); track exercise.exerciseId) {
                        <div class="flex items-center gap-3 bg-green-50 p-3 rounded-lg text-sm border border-green-200 hover:border-green-300 transition">
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
                  <div>
                    <h3 class="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <svg class="w-4 h-4 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      Next Exercise
                    </h3>
                    <div class="bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-300 rounded-lg p-4">
                      <p class="text-sky-900 font-bold text-base">{{ next.excersiceName }}</p>
                      <p class="text-sky-700 text-xs mt-2 font-semibold">
                        Exercise {{ getExerciseIndex(next.exerciseId) }} of {{ exercises().length }}
                      </p>
                    </div>
                  </div>
                } @else {
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300 rounded-lg p-4">
                    <p class="text-green-900 font-bold text-base flex items-center gap-2">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Workout Completed!
                    </p>
                  </div>
                }

                <!-- Remaining Exercises -->
                @if (getRemainingExercises().length > 0) {
                  <div>
                    <h3 class="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="1" />
                      </svg>
                      Remaining ({{ getRemainingExercises().length }})
                    </h3>
                    <div class="space-y-2 max-h-24 overflow-y-auto">
                      @for (exercise of getRemainingExercises(); track exercise.exerciseId) {
                        <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg text-sm border border-gray-200 hover:border-sky-300 transition">
                          <span class="w-6 h-6 rounded-full bg-gradient-to-br from-sky-200 to-indigo-200 text-sky-700 flex items-center justify-center font-bold text-xs flex-shrink-0">{{ getExerciseIndex(exercise.exerciseId) }}</span>
                          <span class="text-gray-700 font-medium">{{ exercise.excersiceName }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Modal Footer -->
              <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 sticky bottom-0">
                <button
                  (click)="cancelStartWorkout()"
                  class="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 text-sm"
                >
                  Cancel
                </button>
                @if (nextExerciseToExecute()) {
                  <button
                    (click)="proceedWithWorkout()"
                    class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 active:scale-95 text-sm shadow-lg"
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
          <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn p-4">
            <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slideUp border border-gray-100">
              <div class="bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 text-white rounded-t-2xl">
                <h2 class="text-2xl font-bold mb-1">Resume Workout?</h2>
                <p class="text-sky-100 text-sm">Continue from where you left off</p>
              </div>

              <div class="p-8 text-center space-y-6">
                <!-- Progress Display -->
                <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                  <p class="text-gray-600 text-sm font-semibold mb-3 uppercase tracking-wider">Progress</p>
                  <p class="text-4xl font-bold text-orange-600 mb-3">{{ completedCount() }}/{{ exercises().length }}</p>
                  <div class="w-full bg-orange-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all" [style.width.%]="(completedCount() / exercises().length * 100 || 0)"></div>
                  </div>
                  <p class="text-sm text-orange-700 mt-3 font-semibold">{{ (completedCount() / exercises().length * 100 | number:'1.0-0') || 0 }}% Complete</p>
                </div>

                <!-- Next Exercise -->
                <div class="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl p-4 border border-sky-300">
                  <p class="text-gray-600 text-xs font-bold uppercase tracking-wider mb-2">Next Exercise</p>
                  <p class="text-xl font-bold text-sky-900">{{ getNextExerciseName() }}</p>
                </div>

                <!-- Countdown -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p class="text-yellow-900 font-semibold text-sm">Resuming in <span class="text-2xl font-bold text-yellow-600">{{ resumeCountdown() }}</span> seconds...</p>
                </div>
              </div>

              <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 rounded-b-2xl">
                <button
                  (click)="cancelResume()"
                  class="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  (click)="continueWorkout()"
                  class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 active:scale-95 shadow-lg"
                >
                  Resume Now
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <!-- Completion Status -->
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden group">
              <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-100 to-indigo-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div class="relative z-10 flex items-center justify-between">
                <div>
                  <p class="text-gray-600 text-xs font-bold uppercase tracking-wider mb-2">Status</p>
                  <p class="text-3xl sm:text-4xl font-bold" [class.text-green-600]="isDayCompleted()" [class.text-sky-600]="!isDayCompleted()">
                    {{ isDayCompleted() ? '✓' : '→' }}
                  </p>
                  <p class="text-sm text-gray-600 mt-1 font-semibold">{{ isDayCompleted() ? 'Completed' : 'Ready' }}</p>
                </div>
                <div [class]="isDayCompleted() ? 'bg-green-100' : 'bg-sky-100'" class="rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300">
                  <svg [class]="isDayCompleted() ? 'text-green-600' : 'text-sky-600'" class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Exercise Count -->
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden group">
              <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div class="relative z-10">
                <p class="text-gray-600 text-xs font-bold uppercase tracking-wider mb-3">Total Exercises</p>
                <p class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{{ exercises().length }}</p>
                <div class="flex items-center gap-2 mt-3">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p class="text-sm text-gray-600 font-semibold">{{ completedCount() }} completed</p>
                </div>
              </div>
            </div>

            <!-- Completion Rate -->
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden group sm:col-span-2 lg:col-span-1">
              <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div class="relative z-10">
                <p class="text-gray-600 text-xs font-bold uppercase tracking-wider mb-3">Progress</p>
                <p class="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">{{ (completedCount() / exercises().length * 100 | number:'1.0-0') || 0 }}%</p>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500" [style.width.%]="(completedCount() / exercises().length * 100 || 0)"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Start Workout Button -->
          <div class="flex justify-center my-8">
            <button
              (click)="startWorkout()"
              [disabled]="isDayCompleted()"
              class="bg-gradient-to-r from-sky-600 to-indigo-600
                     hover:from-sky-700 hover:to-indigo-700
                     text-white font-bold text-base sm:text-lg
                     py-4 sm:py-5 px-8 sm:px-12 rounded-2xl
                     shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                     active:scale-95 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
              </svg>
              {{ isDayCompleted() ? 'Workout Completed' : (completedCount() > 0 ? 'Resume Workout' : 'Start Workout') }}
            </button>
          </div>

          <!-- Exercises Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            @for (exercise of exercises(); track exercise.exerciseId; let i = $index) {
              <div
                (click)="startExerciseExecution(exercise.exerciseId)"
                [class.ring-2]="isExerciseCompleted(exercise.exerciseId)"
                [class.ring-green-500]="isExerciseCompleted(exercise.exerciseId)"
                [class.opacity-50]="isDayCompleted()"
                [class.cursor-not-allowed]="isDayCompleted()"
                [class.pointer-events-none]="isDayCompleted()"
                class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 flex flex-col relative hover:scale-105"
                [style.backgroundImage]="exercise.thumbnailUrl ? 'url(' + exercise.thumbnailUrl + ')' : 'none'"
                [style.backgroundSize]="'cover'"
                [style.backgroundPosition]="'center'"
              >
                <!-- Dark Overlay -->
                @if (exercise.thumbnailUrl) {
                  <div class="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300"></div>
                }

                <!-- Content -->
                <div class="relative z-10 flex flex-col h-full justify-between">
                  <!-- Top Section: Exercise Info -->
                  <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                      <div class="flex-1">
                        <span class="inline-block text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full mb-3">
                          Exercise {{ i + 1 }}
                        </span>
                        <h3 class="text-lg font-bold text-gray-900 leading-tight line-clamp-2">{{ exercise.excersiceName }}</h3>
                      </div>
                      @if (isExerciseCompleted(exercise.exerciseId)) {
                        <div class="bg-green-500 text-white rounded-full p-2.5 flex-shrink-0 ml-3 shadow-lg">
                          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      }
                    </div>

                    <!-- Equipment Tag -->
                    @if (exercise.equipment) {
                      <span class="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1.5 rounded-lg text-sm font-semibold">
                        {{ exercise.equipment }}
                      </span>
                    }
                  </div>

                  <!-- Middle Section: Stats Grid -->
                  <div class="px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <div class="grid grid-cols-3 gap-3">
                      <div class="text-center">
                        <p class="text-xs font-bold text-gray-600 mb-2">SETS</p>
                        <p class="text-3xl font-bold text-sky-600">{{ exercise.sets }}</p>
                      </div>
                      <div class="text-center border-l border-r border-gray-300">
                        <p class="text-xs font-bold text-gray-600 mb-2">REPS</p>
                        <p class="text-3xl font-bold text-green-600">{{ exercise.reps }}</p>
                      </div>
                      <div class="text-center">
                        <p class="text-xs font-bold text-gray-600 mb-2">REST</p>
                        <p class="text-3xl font-bold text-orange-600">{{ exercise.restSeconds }}<span class="text-sm">s</span></p>
                      </div>
                    </div>
                  </div>

                  <!-- Bottom Section: CTA -->
                  <div class="px-6 py-4 bg-gradient-to-r from-sky-50 to-indigo-50 flex items-center justify-between group-hover:from-sky-100 group-hover:to-indigo-100 transition-all duration-300">
                    <span class="text-base font-bold text-gray-700">Start</span>
                    <svg class="w-6 h-6 text-sky-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 sm:gap-4 justify-center">
            <button
              (click)="goToDetail()"
              class="border-2 border-sky-600 text-sky-600 hover:bg-sky-50 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 hover:border-sky-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </button>
            <button
              (click)="goToPrograms()"
              class="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 0118 0 9 9 0 01-18 0z"></path>
              </svg>
              My Programs
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
export class ProgramDayDetailComponent implements OnInit, OnDestroy {
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
    console.log('🏋️ START WORKOUT clicked');
    console.log('Current exercises:', this.exercises());
    console.log('Day ID:', this.dayId);
    // Show the progress modal
    this.showStartWorkoutModal.set(true);
    console.log('Modal state:', this.showStartWorkoutModal());
  }

  /**
   * Called when user clicks "Continue Workout" in the modal
   */
  proceedWithWorkout() {
    console.log('✅ PROCEED WITH WORKOUT clicked');
    const exercisesData = this.exercises().map((ex: any) => ({
      id: ex.exerciseId ?? ex.id,
      sets: Number(ex.sets),
      reps: ex.reps
    }));

    const completedIds = this.completedExerciseIds();
    console.log('Exercises:', exercisesData);
    console.log('Completed IDs:', completedIds);

    // Initialize the workout session with all exercises (in case user starts from scratch)
    // This will include completedExerciseIds in the session
    this.workoutStateService.initializeWorkout(this.dayId, exercisesData, completedIds);
    console.log('Workout initialized');

    // Get the next exercise to execute
    const nextExercise = this.nextExerciseToExecute();
    console.log('Next exercise:', nextExercise);
    
    if (nextExercise) {
      // Close modal and navigate to next exercise
      this.showStartWorkoutModal.set(false);
      console.log('Navigating to exercise:', nextExercise.exerciseId);
      this.router.navigate(['/exercise', nextExercise.exerciseId, 'execute'], {
        queryParams: { dayId: this.dayId, programId: this.programId }
      });
    } else {
      console.warn('⚠️ No next exercise found!');
      alert('No exercises available. Make sure exercises are loaded.');
    }
  }

  cancelStartWorkout() {
    console.log('❌ CANCEL clicked');
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
    if (this.isDayCompleted()) {
      console.warn('⛔ Day completed: Cannot start more exercises');
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
    this.router.navigate(['/my-active-programs']);
  }

  ngOnDestroy() {
    this.clearResumeTimer();
  }
}
