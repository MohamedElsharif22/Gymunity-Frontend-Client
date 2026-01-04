import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SubscriptionService, SubscriptionResponse } from '../packages/services/subscription.service';
import { ProgramService } from '../classes/services/program.service';
import { WorkoutService } from '../workout/services/workout.service';
import { Program, ProgramWeek, ProgramDay, DayExercise } from '../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-slate-900 mb-2">My Subscription</h1>
          <p class="text-slate-600">View your active package, programs, and workout schedule</p>
        </div>

        <!-- Active Subscription Card -->
        <div *ngIf="activeSubscription()" class="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <!-- Header with Status -->
          <div class="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h2 class="text-3xl font-bold">{{ activeSubscription()?.packageName }}</h2>
                <p class="text-green-100 mt-2">{{ activeSubscription()?.packageDescription }}</p>
              </div>
              <div class="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p class="text-sm font-semibold">Status: <span class="text-green-200">{{ activeSubscription()?.status }}</span></p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 text-sm">
              <div>
                <p class="text-green-100">Trainer</p>
                <p class="font-semibold">{{ activeSubscription()?.trainerName }}</p>
              </div>
              <div>
                <p class="text-green-100">Start Date</p>
                <p class="font-semibold">{{ activeSubscription()?.startDate | date:'MMM dd, yyyy' }}</p>
              </div>
              <div>
                <p class="text-green-100">End Date</p>
                <p class="font-semibold">{{ activeSubscription()?.currentPeriodEnd | date:'MMM dd, yyyy' }}</p>
              </div>
              <div>
                <p class="text-green-100">Days Remaining</p>
                <p class="font-semibold">{{ activeSubscription()?.daysRemaining }} days</p>
              </div>
            </div>
          </div>

          <!-- Package Amount -->
          <div class="px-8 py-4 bg-slate-50 border-b">
            <div class="flex justify-between items-center">
              <span class="text-slate-600 font-medium">Amount Paid</span>
              <span class="text-2xl font-bold text-green-600">
                {{ activeSubscription()?.currency }} {{ activeSubscription()?.amountPaid | number:'1.2-2' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="!activeSubscription() && isLoading()" class="text-center py-12">
          <div class="inline-block">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p class="text-slate-600 mt-4">Loading your subscription...</p>
          </div>
        </div>

        <!-- No Active Subscription -->
        <div *ngIf="!activeSubscription() && !isLoading()" class="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
          <p class="text-slate-600 mb-4">You don't have an active subscription yet.</p>
          <a routerLink="/packages" class="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            Browse Packages
          </a>
        </div>

        <!-- Programs Section -->
        <div *ngIf="activeSubscription()" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Weeks Navigation -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 class="text-xl font-bold text-slate-900 mb-4">Program Weeks</h3>
              <div class="space-y-2">
                <button
                  *ngFor="let week of programWeeks()"
                  (click)="selectWeek(week)"
                  [class]="'w-full text-left px-4 py-3 rounded-lg font-medium transition ' +
                    (selectedWeek()?.id === week.id ? 'bg-green-100 text-green-900 border-l-4 border-green-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')">
                  Week {{ week.weekNumber }}
                </button>
              </div>
            </div>
          </div>

          <!-- Days and Exercises -->
          <div class="lg:col-span-2">
            <!-- Selected Week -->
            <div *ngIf="selectedWeek()" class="bg-white rounded-lg shadow-lg overflow-hidden">
              <div class="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-6 text-white">
                <h3 class="text-2xl font-bold">Week {{ selectedWeek()?.weekNumber }}</h3>
              </div>

              <!-- Days in Week -->
              <div class="divide-y">
                <div *ngFor="let day of selectedWeek()?.days" class="p-6 hover:bg-slate-50 transition">
                  <div class="flex justify-between items-start gap-4">
                    <button
                      (click)="toggleDayExpanded(day.id)"
                      class="flex-1 text-left">
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="text-lg font-bold text-slate-900">
                          Day {{ day.dayNumber }}: {{ day.title }}
                        </h4>
                        <svg [class]="'w-6 h-6 text-slate-400 transition transform ' + (expandedDays().includes(day.id) ? 'rotate-180' : '')"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                      </div>
                      <p *ngIf="day.notes" class="text-sm text-slate-600">{{ day.notes }}</p>
                    </button>

                    <!-- Start Workout Button -->
                    <button
                      (click)="openWorkoutDialog(day)"
                      class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition whitespace-nowrap">
                      Start Workout
                    </button>

                    <!-- View Exercises Button -->
                    <button
                      (click)="viewDayExercises(day)"
                      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition whitespace-nowrap">
                      👁 View Exercises
                    </button>
                  </div>

                  <!-- Exercises for this day -->
                  <div *ngIf="expandedDays().includes(day.id)" class="mt-4 pt-4 border-t space-y-4">
                    <div *ngFor="let exercise of day.exercises" class="bg-blue-50 rounded-lg p-4">
                      <div class="flex items-start justify-between mb-3">
                        <div>
                          <h5 class="font-bold text-slate-900">{{ exercise.excersiceName || exercise.exercise?.name }}</h5>
                          <p class="text-sm text-slate-600">{{ exercise.muscleGroup }}</p>
                        </div>
                        <span class="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">{{ exercise.equipment }}</span>
                      </div>

                      <!-- Exercise Image -->
                      <div *ngIf="exercise.thumbnailUrl" class="mb-3 rounded-lg overflow-hidden">
                        <img [src]="exercise.thumbnailUrl" [alt]="exercise.excersiceName" class="w-full h-40 object-cover">
                      </div>

                      <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div class="bg-white p-2 rounded">
                          <p class="text-slate-600">Sets</p>
                          <p class="font-bold text-slate-900">{{ exercise.sets }}</p>
                        </div>
                        <div class="bg-white p-2 rounded">
                          <p class="text-slate-600">Reps</p>
                          <p class="font-bold text-slate-900">{{ exercise.reps }}</p>
                        </div>
                        <div class="bg-white p-2 rounded" *ngIf="exercise.restSeconds">
                          <p class="text-slate-600">Rest</p>
                          <p class="font-bold text-slate-900">{{ exercise.restSeconds }}s</p>
                        </div>
                        <div class="bg-white p-2 rounded" *ngIf="exercise.rpe">
                          <p class="text-slate-600">RPE</p>
                          <p class="font-bold text-slate-900">{{ exercise.rpe }}/10</p>
                        </div>
                      </div>

                      <div *ngIf="exercise.category" class="mb-2">
                        <span class="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">{{ exercise.category }}</span>
                      </div>

                      <p *ngIf="exercise.notes" class="text-sm text-slate-700 bg-white p-2 rounded mb-2">
                        <strong>Notes:</strong> {{ exercise.notes }}
                      </p>

                      <a *ngIf="exercise.videoDemoUrl"
                        [href]="exercise.videoDemoUrl"
                        target="_blank"
                        class="inline-block text-sm text-blue-600 hover:text-blue-800 font-semibold">
                        📹 Watch Demo
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No week selected -->
            <div *ngIf="!selectedWeek()" class="bg-white rounded-lg shadow-lg p-12 text-center">
              <p class="text-slate-600 mb-4">Select a week to view the workout program</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div *ngIf="activeSubscription()" class="mt-8 flex gap-4 justify-center">
          <a routerLink="/dashboard" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            Back to Dashboard
          </a>
          <button
            (click)="cancelSubscription()"
            class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            Cancel Subscription
          </button>
        </div>

        <!-- Workout Dialog Modal -->
        <div *ngIf="showWorkoutDialog()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6 text-white sticky top-0">
              <div class="flex justify-between items-center">
                <div>
                  <h2 class="text-2xl font-bold">{{ selectedDay()?.title }}</h2>
                  <p class="text-green-100 mt-1" *ngIf="selectedDay()?.notes">{{ selectedDay()?.notes }}</p>
                </div>
                <button
                  (click)="closeWorkoutDialog()"
                  class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="p-8">
              <!-- Ready Confirmation -->
              <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-6">
                <h3 class="text-lg font-bold text-blue-900 mb-2">Are you ready to start this workout?</h3>
                <p class="text-blue-700">Make sure you have the equipment ready and sufficient time to complete all exercises.</p>
              </div>

              <!-- Workout Summary -->
              <div class="mb-6">
                <h4 class="text-lg font-bold text-slate-900 mb-4">Workout Summary</h4>
                <div class="grid grid-cols-3 gap-4">
                  <div class="bg-slate-100 p-4 rounded text-center">
                    <p class="text-2xl font-bold text-slate-900">{{ selectedDay()?.exercises?.length }}</p>
                    <p class="text-sm text-slate-600">Exercises</p>
                  </div>
                  <div class="bg-slate-100 p-4 rounded text-center">
                    <p class="text-2xl font-bold text-slate-900">~45-60</p>
                    <p class="text-sm text-slate-600">Est. Duration (min)</p>
                  </div>
                  <div class="bg-slate-100 p-4 rounded text-center">
                    <p class="text-2xl font-bold text-slate-900">{{ selectedDayTotalSets() }}</p>
                    <p class="text-sm text-slate-600">Total Sets</p>
                  </div>
                </div>
              </div>

              <!-- Exercise List Preview -->
              <div class="mb-6">
                <h4 class="text-lg font-bold text-slate-900 mb-4">Exercises</h4>
                <div class="space-y-3">
                  <div *ngFor="let exercise of selectedDay()?.exercises" class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h5 class="font-bold text-slate-900">{{ exercise.excersiceName }}</h5>
                        <p class="text-sm text-slate-600 mt-1">
                          {{ exercise.sets }} sets × {{ exercise.reps }} reps
                          <span *ngIf="exercise.restSeconds" class="ml-2">• Rest: {{ exercise.restSeconds }}s</span>
                        </p>
                      </div>
                      <span class="text-xs bg-green-200 text-green-800 px-2 py-1 rounded whitespace-nowrap ml-2">{{ exercise.category }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4">
                <button
                  (click)="closeWorkoutDialog()"
                  class="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition">
                  Cancel
                </button>
                <button
                  (click)="startWorkout(selectedDay()!)"
                  class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg transition">
                  ✓ Start Workout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  private subscriptionService = inject(SubscriptionService);
  private programService = inject(ProgramService);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private destroy$ = new Subject<void>();

  // State signals
  activeSubscription = signal<SubscriptionResponse | null>(null);
  programWeeks = signal<ProgramWeek[]>([]);
  selectedWeek = signal<ProgramWeek | null>(null);
  expandedDays = signal<number[]>([]);
  isLoading = signal(true);
  showWorkoutDialog = signal(false);
  selectedDay = signal<ProgramDay | null>(null);

  // Computed signals
  selectedDayTotalSets = computed(() => {
    const day = this.selectedDay();
    if (!day || !day.exercises) return 0;
    return day.exercises.reduce((total, exercise) => {
      return total + parseInt(exercise.sets || '0', 10);
    }, 0);
  });

  ngOnInit() {
    this.loadActiveSubscription();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadActiveSubscription() {
    this.isLoading.set(true);
    this.subscriptionService.getMySubscriptions('Active')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const subscriptions = response.data?.subscriptions || [];
          const active = subscriptions.find((s: any) => s.status === 'Active' || s.status === 'ACTIVE');

          if (active) {
            this.activeSubscription.set(active);
            this.loadPackagePrograms();
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading subscription:', err);
          this.isLoading.set(false);
        }
      });
  }

  private loadPackagePrograms() {
    // Get all programs and filter by package
    this.programService.getAllActivePrograms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (programs: any[]) => {
          if (programs && programs.length > 0) {
            // Load weeks for the first program
            this.loadProgramWeeks(programs[0].id);
          }
        },
        error: (err) => {
          console.error('Error loading programs:', err);
        }
      });
  }

  private currentProgramId: number | null = null;

  private loadProgramWeeks(programId: number) {
    this.currentProgramId = programId;
    this.programService.getProgramWeeks(programId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (weeks: any[]) => {
          // weeks should already have the structure from API
          this.programWeeks.set(weeks);
          // Select first week by default and load its days
          if (weeks && weeks.length > 0) {
            const firstWeek = weeks[0];
            this.selectedWeek.set(firstWeek);
            // Load all days for the program (not per week)
            this.loadAllProgramDays(programId);
          }
        },
        error: (err) => {
          console.error('Error loading program weeks:', err);
        }
      });
  }

  private loadAllProgramDays(programId: number) {
    // Load all days for the program
    this.programService.getProgramDays(programId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (daysData: any[]) => {
          console.log('[SubscriptionsComponent] Days data received:', daysData);
          console.log('[SubscriptionsComponent] Program weeks:', this.programWeeks());

          // daysData should be an array of all days for the program
          if (daysData && daysData.length > 0) {
            // Group days by week
            const weeks = this.programWeeks();
            weeks.forEach(week => {
              // Log to debug the grouping
              console.log(`[SubscriptionsComponent] Looking for days for week ${week.id} (weekNumber: ${week.weekNumber})`);

              // Filter days that belong to this week
              const matchedDays = daysData.filter(day => {
                const match = day.programWeekId === week.id;
                console.log(`  Day ${day.id} (weekId: ${day.programWeekId}) matches: ${match}`);
                return match;
              });

              console.log(`  Found ${matchedDays.length} days for week ${week.id}`);
              week.days = matchedDays;
            });
            this.programWeeks.set([...weeks]);

            // Update selected week with its days
            const selectedWeek = this.selectedWeek();
            if (selectedWeek) {
              selectedWeek.days = daysData.filter(day => day.programWeekId === selectedWeek.id);
              this.selectedWeek.set({ ...selectedWeek });
            }
          } else {
            console.log('[SubscriptionsComponent] No days data received');
          }
        },
        error: (err) => {
          console.error('Error loading program days:', err);
        }
      });
  }

  selectWeek(week: ProgramWeek) {
    this.selectedWeek.set(week);
    this.expandedDays.set([]); // Reset expanded days
  }

  toggleDayExpanded(dayId: number) {
    const expanded = this.expandedDays();
    if (expanded.includes(dayId)) {
      this.expandedDays.set(expanded.filter(id => id !== dayId));
    } else {
      this.expandedDays.set([...expanded, dayId]);
    }
  }

  openWorkoutDialog(day: ProgramDay) {
    this.selectedDay.set(day);
    this.showWorkoutDialog.set(true);
  }

  closeWorkoutDialog() {
    this.showWorkoutDialog.set(false);
    this.selectedDay.set(null);
  }

  startWorkout(day: ProgramDay) {
    // Close the dialog first
    this.closeWorkoutDialog();
    // Start workout in service
    this.workoutService.startWorkout(day);
    // Navigate to workout day page
    this.router.navigate(['/workout/day']);
  }

  viewDayExercises(day: ProgramDay) {
    // Navigate to exercises view page
    this.router.navigate(['/workout/exercises'], { state: { day } });
  }

  cancelSubscription() {
    const subscription = this.activeSubscription();
    if (subscription && confirm('Are you sure you want to cancel this subscription?')) {
      this.subscriptionService.cancelSubscription(subscription.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Subscription cancelled successfully');
            this.router.navigate(['/packages']);
          },
          error: (err) => {
            console.error('Error cancelling subscription:', err);
            alert('Failed to cancel subscription');
          }
        });
    }
  }
}
