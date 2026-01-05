import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SubscriptionService, SubscriptionResponse } from '../packages/services/subscription.service';
import { ProgramService } from '../classes/services/program.service';
import { Program, ProgramWeek, ProgramDay, DayExercise } from '../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div class="max-w-5xl mx-auto">
        <!-- Header Section -->
        <div class="text-center mb-12 animate-fadeIn">
          <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-3">
            My Subscription
          </h1>
          <p class="text-xl text-slate-300">Your premium fitness journey</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="!activeSubscription() && isLoading()" class="text-center py-20">
          <div class="inline-block">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/30 border-t-emerald-400"></div>
            <p class="text-slate-300 mt-6 text-lg">Loading your subscription...</p>
          </div>
        </div>

        <!-- No Active Subscription -->
        <div *ngIf="!activeSubscription() && !isLoading()" class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center mb-8 animate-slideDown">
          <svg class="w-20 h-20 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-slate-300 mb-6 text-lg">You don't have an active subscription yet.</p>
          <a routerLink="/packages" class="inline-block bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105">
            Browse Packages
          </a>
        </div>

        <!-- Active Subscription Card -->
        <div *ngIf="activeSubscription()" class="animate-slideDown">
          <!-- Subscriptions Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Main Subscription Card -->
            <div class="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-xl">
              <!-- Premium Header -->
              <div class="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-cyan-500 to-blue-600 p-4 md:p-6">
                <!-- Animated Background Elements -->
                <div class="absolute inset-0 opacity-10">
                  <div class="absolute top-0 left-0 w-20 h-20 bg-white rounded-full mix-blend-screen"></div>
                  <div class="absolute bottom-0 right-0 w-20 h-20 bg-white rounded-full mix-blend-screen"></div>
                </div>

                <div class="relative z-10">
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <div class="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
                        <p class="text-white/90 text-xs font-semibold">✓ Active</p>
                      </div>
                      <h2 class="text-2xl font-black text-white mb-1">{{ activeSubscription()?.packageName }}</h2>
                      <p class="text-white/80 text-sm">{{ activeSubscription()?.packageDescription }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-white/70 text-xs font-semibold mb-1">TOTAL PAID</p>
                      <p class="text-xl font-black text-white">
                        {{ activeSubscription()?.currency }} {{ activeSubscription()?.amountPaid | number:'1.2-2' }}
                      </p>
                    </div>
                  </div>

                  <!-- Key Info Grid -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p class="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Trainer</p>
                      <p class="text-white font-bold text-sm">{{ activeSubscription()?.trainerName }}</p>
                    </div>
                    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p class="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Start Date</p>
                      <p class="text-white font-bold text-sm">{{ activeSubscription()?.startDate | date:'MMM dd' }}</p>
                    </div>
                    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p class="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">End Date</p>
                      <p class="text-white font-bold text-sm">{{ activeSubscription()?.currentPeriodEnd | date:'MMM dd' }}</p>
                    </div>
                    <div class="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-lg p-3 border border-orange-400/30">
                      <p class="text-orange-200 text-xs font-semibold uppercase tracking-wide mb-1">Days Left</p>
                      <p class="text-white font-black text-lg">{{ activeSubscription()?.daysRemaining }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Benefits Section -->
              <div class="p-4 md:p-6 border-t border-white/10">
                <h3 class="text-lg font-bold text-white mb-4">What's Included</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <!-- Benefit 1 -->
                  <div class="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-3">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <h4 class="text-white font-bold mb-1 text-sm">Workout Plans</h4>
                    <p class="text-slate-400 text-xs">Personalized programs</p>
                  </div>

                  <!-- Benefit 2 -->
                  <div class="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-3">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h4 class="text-white font-bold mb-1 text-sm">Expert Support</h4>
                    <p class="text-slate-400 text-xs">Pro trainers</p>
                  </div>

                  <!-- Benefit 3 -->
                  <div class="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center mb-3">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <h4 class="text-white font-bold mb-1 text-sm">Progress Track</h4>
                    <p class="text-slate-400 text-xs">Analytics</p>
                  </div>
                </div>
              </div>

              <!-- Timeline Info -->
              <div class="px-4 md:px-6 py-4 bg-white/5 border-t border-white/10">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-slate-400 text-xs">Since</p>
                      <p class="text-white font-bold text-sm">{{ activeSubscription()?.startDate | date:'MMM d, yyyy' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-slate-400 text-xs">Expires</p>
                      <p class="text-white font-bold text-sm">{{ activeSubscription()?.currentPeriodEnd | date:'MMM d, yyyy' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add More Packages Card -->
            <div class="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-dashed border-white/30 rounded-xl overflow-hidden shadow-xl flex items-center justify-center p-6 hover:bg-white/10 transition cursor-pointer" (click)="navigateToPackages()">
              <div class="text-center">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </div>
                <h3 class="text-white font-bold text-lg mb-2">Add More Packages</h3>
                <p class="text-slate-400 text-sm mb-4">Subscribe to additional packages to diversify your fitness journey</p>
                <span class="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Browse Packages</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 justify-center animate-slideUp" style="animation-delay: 0.2s;">
            <a routerLink="/dashboard" 
              class="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-1 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50">
              <div class="relative bg-slate-900 rounded-[6px] px-8 py-3 flex items-center justify-center gap-2 font-bold text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m2 3l2-3m2 3l2-3m2-4l2 3m-2-3V7m6 0v10m6-10v10m0 0l-2-3m2 3l-2-3"></path>
                </svg>
                Back to Dashboard
              </div>
            </a>
            <button
              (click)="cancelSubscription()"
              class="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-red-600 p-1 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50">
              <div class="relative bg-slate-900 rounded-[6px] px-8 py-3 flex items-center justify-center gap-2 font-bold text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Cancel Subscription
              </div>
            </button>
          </div>
        </div>
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
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host ::ng-deep {
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }

      .animate-slideDown {
        animation: slideDown 0.6s ease-out forwards;
        opacity: 0;
      }

      .animate-slideUp {
        animation: slideUp 0.6s ease-out forwards;
        opacity: 0;
      }
    }
  `]
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  private subscriptionService = inject(SubscriptionService);
  private programService = inject(ProgramService);
  private router = inject(Router);
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
    // Navigate to workout day page
    this.router.navigate(['/programs', day.id]);
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

  navigateToPackages() {
    this.router.navigate(['/packages']);
  }}