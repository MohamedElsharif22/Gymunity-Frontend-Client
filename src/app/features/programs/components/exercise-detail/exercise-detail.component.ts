import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Exercise } from '../../services/program.service';
import { ExerciseStateService } from '../../services/exercise-state.service';
import { WorkoutExecutionStateService, ExecutedExercise } from '../../services/workout-execution-state.service';
import { WorkoutLogService, WorkoutLogRequest } from '../../services/workout-log.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <!-- Ambient Background Elements -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-sky-500 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 max-w-2xl mx-auto py-6 px-4 sm:px-6">
        <!-- Back Button -->
        <button
          (click)="goBack()"
          class="group mb-6 inline-flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg backdrop-blur-sm animate-fadeIn">
          <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span class="font-medium text-sm">Back</span>
        </button>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-16">
            <div class="relative w-12 h-12 mb-4">
              <div class="absolute inset-0 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div class="relative w-12 h-12 rounded-full border-2 border-slate-700 border-t-sky-500 border-r-emerald-500 animate-spin"></div>
            </div>
            <p class="text-slate-300 text-sm font-medium">Loading...</p>
          </div>
        }

        <!-- Content -->
        @else if (exercise()) {
          <!-- Already Completed Modal -->
          @if (showAlreadyCompletedModal()) {
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/50 p-8 max-w-sm animate-bounceIn">
                <div class="flex flex-col items-center text-center">
                  <div class="mb-6 text-5xl">✅</div>
                  <h2 class="text-2xl font-black text-white mb-3">Already Completed!</h2>
                  <p class="text-slate-300 text-sm mb-6 leading-relaxed">You have already completed this exercise in this workout. Great work! 💪</p>
                  <div class="w-full bg-slate-700 rounded-lg h-1 mb-4 overflow-hidden">
                    <div
                      class="bg-gradient-to-r from-sky-500 to-emerald-500 h-full transition-all duration-1000"
                      [style.width]="((5 - redirectCountdown()) / 5 * 100) + '%'">
                    </div>
                  </div>
                  <p class="text-amber-400 text-sm font-semibold">Redirecting in {{ redirectCountdown() }}s...</p>
                </div>
              </div>
            </div>
          }

          <div class="space-y-4 animate-fadeIn">
            <!-- Exercise Header with Image Overlay -->
            <div class="relative overflow-hidden rounded-xl">
              @if (exercise()?.thumbnailUrl) {
                <img
                  [src]="exercise()?.thumbnailUrl"
                  [alt]="exercise()?.excersiceName"
                  class="w-full h-48 sm:h-56 object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              } @else {
                <div class="w-full h-48 sm:h-56 bg-gradient-to-br from-sky-600 to-emerald-600"></div>
              }
              <div class="absolute bottom-0 left-0 right-0 p-4 animate-slideDown">
                <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">{{ exercise()?.excersiceName }}</h1>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2 py-1 bg-sky-500/30 border border-sky-500/50 rounded-full text-xs font-semibold text-sky-200 backdrop-blur-sm">
                    {{ exercise()?.category }}
                  </span>
                  <span class="px-2 py-1 bg-emerald-500/30 border border-emerald-500/50 rounded-full text-xs font-semibold text-emerald-200 backdrop-blur-sm">
                    {{ exercise()?.muscleGroup }}
                  </span>
                  <span class="px-2 py-1 bg-violet-500/30 border border-violet-500/50 rounded-full text-xs font-semibold text-violet-200 backdrop-blur-sm">
                    {{ exercise()?.equipment }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            @if (exercise()?.notes) {
              <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 animate-slideDown" style="animation-delay: 0.1s;">
                <p class="text-slate-200 text-sm leading-relaxed">{{ exercise()?.notes }}</p>
              </div>
            }

            <!-- Exercise Details Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Parameters Card -->
              <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 hover:border-sky-500/50 transition-all duration-300 animate-slideDown" style="animation-delay: 0.15s;">
                <h2 class="text-lg font-bold text-white mb-4">Parameters</h2>
                <div class="space-y-3">
                  <div class="pb-3 border-b border-white/10">
                    <p class="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Sets</p>
                    <p class="text-2xl font-black text-sky-400">{{ exercise()?.sets }}</p>
                  </div>
                  <div class="pb-3 border-b border-white/10">
                    <p class="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Reps</p>
                    <p class="text-2xl font-black text-emerald-400">{{ exercise()?.reps }}</p>
                  </div>
                  <div class="pb-3 border-b border-white/10">
                    <p class="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Total Reps</p>
                    <p class="text-2xl font-black text-violet-400">{{ getTotalReps(exercise()!) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Rest Time</p>
                    <p class="text-2xl font-black text-pink-400">{{ exercise()?.restSeconds }}<span class="text-xs">s</span></p>
                  </div>
                </div>
              </div>

              <!-- Advanced Parameters Card -->
              <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 hover:border-emerald-500/50 transition-all duration-300 animate-slideDown" style="animation-delay: 0.2s;">
                <h2 class="text-lg font-bold text-white mb-4">Advanced</h2>
                <div class="space-y-2">
                  @if (exercise()?.tempo) {
                    <div class="p-3 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/50">
                      <p class="text-xs text-amber-300 uppercase tracking-widest font-semibold mb-1">Tempo</p>
                      <p class="text-lg font-black text-amber-300">{{ exercise()?.tempo }}</p>
                    </div>
                  }
                  @if (exercise()?.rpe) {
                    <div class="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/50">
                      <p class="text-xs text-purple-300 uppercase tracking-widest font-semibold mb-1">RPE</p>
                      <p class="text-lg font-black text-purple-300">{{ exercise()?.rpe }}</p>
                    </div>
                  }
                  @if (exercise()?.percent1RM) {
                    <div class="p-3 rounded-lg bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/50">
                      <p class="text-xs text-red-300 uppercase tracking-widest font-semibold mb-1">% 1RM</p>
                      <p class="text-lg font-black text-red-300">{{ exercise()?.percent1RM }}</p>
                    </div>
                  }
                  @if (!exercise()?.tempo && !exercise()?.rpe && !exercise()?.percent1RM) {
                    <div class="text-center py-4">
                      <p class="text-slate-400 text-xs">No advanced parameters</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Video Demo -->
            @if (exercise()?.videoDemoUrl) {
              <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 animate-slideDown" style="animation-delay: 0.25s;">
                <h2 class="text-lg font-bold text-white mb-3">Video Demo</h2>
                <div class="relative w-full rounded-lg overflow-hidden bg-black/30" style="padding-bottom: 56.25%;">
                  <iframe
                    [src]="exercise()?.videoDemoUrl"
                    class="absolute top-0 left-0 w-full h-full"
                    title="Exercise Demo"
                    allowfullscreen>
                  </iframe>
                </div>
              </div>
            }

            <!-- Estimated Time -->
            <div class="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 backdrop-blur-md border border-emerald-500/50 p-6 text-center animate-slideDown" style="animation-delay: 0.3s;">
              <h2 class="text-lg font-bold text-white mb-4">Estimated Time</h2>
              <div class="inline-block">
                <p class="text-xs text-slate-300 mb-2">Total Exercise Time</p>
                <p class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">{{ getExerciseTime(exercise()!) }}</p>
                <p class="text-xs text-slate-300 mt-2">minutes</p>
              </div>
            </div>

            <!-- Warning Message -->
            @if (alreadyCompleted()) {
              <div class="relative overflow-hidden rounded-xl bg-amber-500/20 backdrop-blur-md border border-amber-500/50 p-4 animate-slideDown" style="animation-delay: 0.35s;">
                <div class="flex items-start gap-3">
                  <div class="text-xl">⚠️</div>
                  <div>
                    <p class="text-amber-200 font-semibold text-sm">Already Completed</p>
                    <p class="text-xs text-amber-300/80 mt-1">You completed this exercise already.</p>
                  </div>
                </div>
              </div>
            }

            <!-- Action Buttons -->
            <div class="flex gap-3 flex-col sm:flex-row">
              <button
                (click)="goBack()"
                class="flex-1 group relative overflow-hidden rounded-lg border-2 border-slate-600 hover:border-slate-500 p-1 transition-all duration-300 active:scale-95 animate-slideDown" style="animation-delay: 0.4s;">
                <div class="relative bg-slate-900 rounded-[6px] px-4 py-2 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all text-xs sm:text-sm font-bold text-white">
                  Back
                  <svg class="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </div>
              </button>
              <button
                (click)="startExerciseExecution()"
                [disabled]="executionStarted() || alreadyCompleted()"
                class="flex-1 group relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 p-1 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 animate-slideDown" style="animation-delay: 0.45s;">
                <div class="relative bg-slate-900 rounded-[6px] px-4 py-2 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all text-xs sm:text-sm font-bold text-white">
                  {{ alreadyCompleted() ? 'Already Completed' : 'Start' }}
                  <svg class="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </div>
              </button>
            </div>

            <!-- EXECUTION UI -->
            @if (executionStarted()) {
              <div class="space-y-4 animate-fadeIn">
                <!-- Progress Card -->
                <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 animate-slideDown">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-base font-bold text-white">Progress</h3>
                    <span class="text-xl font-black text-sky-400">{{ currentSet() }}<span class="text-slate-400 text-sm">{{ totalSets() }}</span></span>
                  </div>
                  <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500 animate-slideRight" [style.width]="(completedSets().length / totalSets() * 100) + '%'"></div>
                  </div>
                  <p class="mt-2 text-xs text-slate-400">{{ completedSets().length }}/{{ totalSets() }} sets</p>
                </div>

                @if (!executionCompleted()) {
                  <!-- Reps Selection -->
                  @if (!counterActive() && !isResting()) {
                    <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 animate-slideDown" style="animation-delay: 0.1s;">
                      <h3 class="text-sm font-bold text-white mb-3">Choose Reps</h3>
                      <div class="flex gap-2 flex-wrap">
                        @for (rep of repOptions(); track rep; let i = $index) {
                          <button
                            (click)="selectReps(rep)"
                            [style]="{'animation-delay': (i * 50) + 'ms'}"
                            [class]="'px-4 py-2 rounded-lg font-bold text-xs transition-all duration-200 animate-popIn ' + (selectedReps() === rep ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-500/50 scale-105' : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/20 hover:border-sky-400/50 hover:scale-110')">
                            {{ rep }}
                          </button>
                        }
                      </div>
                    </div>
                  }

                  <!-- Counter -->
                  @if (counterActive()) {
                    <div class="relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 backdrop-blur-md border border-sky-500/50 p-6 flex flex-col items-center justify-center animate-slideDown" style="animation-delay: 0.1s;">
                      <p class="text-slate-300 text-sm mb-4 font-medium animate-fadeIn">Tap for each rep</p>
                      <button
                        (click)="tapCounter()"
                        class="group relative w-40 h-40 rounded-full overflow-hidden transform transition-transform duration-200 active:scale-95">
                        <div class="absolute inset-0 bg-gradient-to-br from-sky-500 to-emerald-500 p-1 animate-pulse">
                          <div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-all duration-200">
                            <span class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 animate-pulse">{{ remainingReps() }}</span>
                          </div>
                        </div>
                        <div class="absolute inset-0 rounded-full shadow-xl shadow-sky-500/50 group-hover:shadow-sky-400/75 transition-all duration-200"></div>
                      </button>
                      <p class="mt-4 text-slate-400 text-xs font-medium">Reps Left</p>
                    </div>
                  }

                  <!-- Rest Timer -->
                  @if (isResting()) {
                    <div (click)="skipRest()" class="cursor-pointer relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md border border-amber-500/50 p-6 text-center animate-slideDown hover:border-amber-400 hover:bg-amber-500/30 transition-all duration-200" style="animation-delay: 0.1s;">
                      <p class="text-amber-200 text-xs mb-3 font-medium">Resting... (Click to Skip)</p>
                      <p class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 animate-bounce">{{ restRemaining() }}</p>
                      <p class="mt-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">seconds</p>
                    </div>
                  }

                  <!-- Set Result -->
                  @if (selectedReps() && !counterActive() && !isResting()) {
                    <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-emerald-500/50 p-4 animate-slideDown" style="animation-delay: 0.1s;">
                      <p class="text-xs text-slate-400 mb-3">Set {{ currentSet() }}: <span class="text-emerald-400 font-bold">{{ selectedReps() }} reps</span></p>
                      <button
                        (click)="nextSet()"
                        class="w-full group relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 p-1 transition-all duration-300 active:scale-95">
                        <div class="relative bg-slate-900 rounded-[6px] px-4 py-2 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all text-xs sm:text-sm font-bold text-white">
                          {{ currentSet() === totalSets() ? 'Complete' : 'Next' }}
                          <svg class="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                          </svg>
                        </div>
                      </button>
                    </div>
                  }
                }

                <!-- Completion Screen -->
                @if (executionCompleted()) {
                  <div class="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 backdrop-blur-md border border-emerald-500/50 p-5 animate-slideDown">
                    <div class="flex flex-col items-center justify-center text-center mb-5">
                      <div class="relative w-16 h-16 mb-4 animate-bounceIn">
                        <div class="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 animate-pulse opacity-75"></div>
                        <div class="relative w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                          <svg class="w-8 h-8 text-emerald-400 animate-scaleIn" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <h2 class="text-2xl sm:text-3xl font-black text-white mb-1 animate-fadeIn">Done!</h2>
                      <p class="text-emerald-300 text-xs">Excellent work! 💪</p>
                    </div>

                    <!-- Stats Grid -->
                    <div class="grid grid-cols-3 gap-2 mb-4">
                      <div class="relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-3 text-center hover:border-sky-400/50 transition-all animate-slideUp" style="animation-delay: 0.1s;">
                        <p class="text-xs text-slate-400 uppercase font-semibold">Sets</p>
                        <p class="text-2xl font-black text-sky-400">{{ totalSets() }}</p>
                      </div>
                      <div class="relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-3 text-center hover:border-emerald-400/50 transition-all animate-slideUp" style="animation-delay: 0.15s;">
                        <p class="text-xs text-slate-400 uppercase font-semibold">Reps</p>
                        <p class="text-2xl font-black text-emerald-400">{{ getTotalCompletedReps() }}</p>
                      </div>
                      <div class="relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-3 text-center hover:border-violet-400/50 transition-all animate-slideUp" style="animation-delay: 0.2s;">
                        <p class="text-xs text-slate-400 uppercase font-semibold">Avg</p>
                        <p class="text-2xl font-black text-violet-400">{{ Math.ceil(getTotalCompletedReps() / totalSets()) }}</p>
                      </div>
                    </div>

                    <!-- Action Button -->
                    <button
                      (click)="goBack()"
                      class="w-full group relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 p-1 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/50 active:scale-95 animate-slideUp" style="animation-delay: 0.25s;">
                      <div class="relative bg-slate-900 rounded-[6px] px-4 py-2 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all text-sm font-bold text-white">
                        Back to Exercises
                      </div>
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @else if (!isLoading() && !exercise()) {
          <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-lg font-bold text-white mb-2">Not Found</h3>
            <p class="text-slate-400 text-sm">Exercise not available</p>
          </div>
        }
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

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideRight {
      from { width: 0; }
      to { width: 100%; }
    }

    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
      }
      100% {
        opacity: 1;
        transform: scale(1);
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

      .animate-slideUp {
        animation: slideUp 0.5s ease-out forwards;
        opacity: 0;
      }

      .animate-slideRight {
        animation: slideRight 0.8s ease-in-out;
      }

      .animate-popIn {
        animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        opacity: 0;
      }

      .animate-scaleIn {
        animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .animate-bounceIn {
        animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    }
  `]
})
export class ExerciseDetailComponent implements OnInit {
  private exerciseStateService = inject(ExerciseStateService);
  private workoutExecutionStateService = inject(WorkoutExecutionStateService);
  private workoutLogService = inject(WorkoutLogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  exercise = signal<Exercise | null>(null);
  isLoading = signal(false);
  exerciseId!: number;
  dayId: number | null = null;
  programId: number | null = null;
  alreadyCompleted = signal(false);
  showCompletionWarning = signal(false);

  // Execution signals
  executionStarted = signal(false);
  executionCompleted = signal(false);
  currentSet = signal(1);
  totalSets = signal(0);
  repOptions = signal<number[]>([]);
  selectedReps = signal<number | null>(null);
  remainingReps = signal(0);
  counterActive = signal(false);
  isResting = signal(false);
  restRemaining = signal(0);
  completedSets = signal<number[]>([]);
  showAlreadyCompletedModal = signal(false);
  redirectCountdown = signal(0);

  ngOnInit() {
    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.exerciseId = parseInt(params['exerciseId'], 10);
      this.dayId = params['dayId'] ? parseInt(params['dayId'], 10) : null;
      this.programId = params['programId'] ? parseInt(params['programId'], 10) : null;

      console.log('Exercise detail loaded - exerciseId:', this.exerciseId);

      // Set program day id in workout state
      if (this.dayId) {
        this.workoutExecutionStateService.setProgramDayId(this.dayId);
      }

      // Check if exercise already completed
      this.alreadyCompleted.set(this.workoutExecutionStateService.isExerciseCompleted(this.exerciseId));

      // Get exercise from service (set by parent component)
      const exerciseData = this.exerciseStateService.getCurrentExercise();
      if (exerciseData && exerciseData.exerciseId === this.exerciseId) {
        console.log('Exercise data from service:', exerciseData);
        this.exercise.set(exerciseData);
        this.isLoading.set(false);
      } else {
        // No exercise data available
        console.warn('No exercise data available. exerciseId:', this.exerciseId, 'stored:', exerciseData?.exerciseId);
        this.exercise.set(null);
        this.isLoading.set(false);
      }
    });
  }

  getTotalReps(exercise: Exercise): number {
    const sets = parseInt(exercise.sets, 10) || 0;
    const reps = parseInt(exercise.reps, 10) || 0;
    return sets * reps;
  }

  protected readonly Math = Math;

  // Execution Methods
  startExerciseExecution() {
    const ex = this.exercise();
    if (!ex) return;

    // Check if exercise is already completed
    if (this.alreadyCompleted()) {
      this.showAlreadyCompletedModal.set(true);
      this.redirectCountdown.set(5);

      // Countdown timer
      const countdownInterval = interval(1000).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(() => {
        const current = this.redirectCountdown();
        if (current <= 1) {
          this.goBack();
        } else {
          this.redirectCountdown.set(current - 1);
        }
      });

      return;
    }

    // Start workout timer on first execution
    if (this.workoutExecutionStateService.getWorkoutStartTime() === null) {
      this.workoutExecutionStateService.startWorkout();
    }

    // Parse sets
    const sets = parseInt(ex.sets, 10) || 3;
    this.totalSets.set(sets);
    this.currentSet.set(1);
    this.completedSets.set([]);

    // Parse reps range
    const repsOptions = this.parseRepsRange(ex.reps);
    this.repOptions.set(repsOptions);

    this.executionStarted.set(true);
    this.executionCompleted.set(false);
  }

  parseRepsRange(repsStr: string): number[] {
    const cleaned = (repsStr || '').replace(/x/gi, '').trim();
    const range = cleaned.match(/(\d+)\s*-\s*(\d+)/);

    if (range) {
      const min = parseInt(range[1], 10);
      const max = parseInt(range[2], 10);
      const opts: number[] = [];
      for (let i = min; i <= max; i++) opts.push(i);
      return opts;
    }

    const single = parseInt(cleaned, 10);
    return isNaN(single) ? [] : [single];
  }

  selectReps(reps: number) {
    this.selectedReps.set(reps);
    this.remainingReps.set(reps);
    this.counterActive.set(true);
  }

  tapCounter() {
    const remaining = this.remainingReps();
    if (remaining <= 0) return;

    const newRemaining = remaining - 1;
    this.remainingReps.set(newRemaining);

    if (newRemaining === 0) {
      // Set completed
      this.counterActive.set(false);
      const completed = this.completedSets();
      completed.push(this.selectedReps()!);
      this.completedSets.set([...completed]);

      // Start rest
      this.startRest();
    }
  }

  startRest() {
    const ex = this.exercise();
    if (!ex) return;

    const restSeconds = ex.restSeconds || 60;
    this.isResting.set(true);
    this.restRemaining.set(restSeconds);

    interval(1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const remaining = this.restRemaining();
      if (remaining <= 1) {
        this.isResting.set(false);
        this.restRemaining.set(0);
      } else {
        this.restRemaining.set(remaining - 1);
      }
    });
  }

  skipRest() {
    this.isResting.set(false);
    this.restRemaining.set(0);
  }

  nextSet() {
    const current = this.currentSet();
    const total = this.totalSets();

    if (current < total) {
      this.currentSet.set(current + 1);
      this.selectedReps.set(null);
      this.remainingReps.set(0);
      this.counterActive.set(false);
    } else {
      // All sets completed
      this.completeExecution();
    }
  }

  getTotalCompletedReps(): number {
    return this.completedSets().reduce((sum, reps) => sum + reps, 0);
  }

  completeExecution() {
    this.executionCompleted.set(true);

    // Build exercise result
    const result: ExecutedExercise = {
      exerciseId: this.exerciseId,
      exerciseName: this.exercise()?.excersiceName || '',
      setsCompleted: this.completedSets().length,
      repsPerSet: this.completedSets(),
      totalReps: this.getTotalCompletedReps(),
      completed: true
    };

    console.log('Exercise Execution Result:', result);

    // Add to workout execution state
    this.workoutExecutionStateService.addExecutedExercise(result);

    // Mark as completed
    this.alreadyCompleted.set(true);

    // End workout timer
    this.workoutExecutionStateService.endWorkout();

    // Save workout log
    this.saveWorkoutLog();
  }

  saveWorkoutLog() {
    const programDayId = this.workoutExecutionStateService.getProgramDayId();
    const executedExercises = this.workoutExecutionStateService.getExecutedExercises();
    const durationMinutes = this.workoutExecutionStateService.getDurationMinutes();
    const totalReps = this.workoutExecutionStateService.getTotalWorkoutReps();

    if (!programDayId) {
      console.error('No program day ID available');
      return;
    }

    const payload: WorkoutLogRequest = {
      ProgramDayId: programDayId,
      CompletedAt: new Date().toISOString(),
      Notes: undefined,
      DurationMinutes: durationMinutes,
      ExercisesLoggedJson: JSON.stringify(executedExercises)
    };

    console.log('Saving workout log:', payload);
    console.log('Total Reps in Workout:', totalReps);
    console.log('Total Exercises Completed:', executedExercises.length);

    this.workoutLogService.saveWorkoutLog(payload).subscribe({
      next: (response) => {
        console.log('Workout logged successfully:', response);
        // Reset state
        this.workoutExecutionStateService.reset();
        // Navigate back
        this.router.navigate(['/programs', this.programId, 'days', this.dayId]);
      },
      error: (err) => {
        console.error('Error saving workout log:', err);
      }
    });
  }

  getExerciseTime(exercise: Exercise): string {
    const secondsPerRep = 2;
    const sets = parseInt(exercise.sets, 10) || 0;
    const reps = parseInt(exercise.reps, 10) || 0;
    const timePerSet = (reps * secondsPerRep) + exercise.restSeconds;
    const totalTime = sets * timePerSet;
    const minutes = Math.ceil(totalTime / 60);
    return minutes.toString();
  }

  startExercise() {
    // Navigate to workout execute with exercise details
    this.router.navigate(['/workout/execute', this.exerciseId]);
  }

  goBack() {
    if (this.dayId && this.programId) {
      // Go back to program day detail
      this.router.navigate(['/programs', this.programId, 'days', this.dayId]);
    } else {
      // Go back to programs
      this.router.navigate(['/programs']);
    }
  }
}
