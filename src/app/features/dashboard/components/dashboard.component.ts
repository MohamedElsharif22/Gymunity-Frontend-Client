import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WorkoutHistoryService } from '../../workout/services/workout-history.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <!-- Main Content -->
      <main class="transition-all duration-300 py-8 px-6">
        <div class="max-w-7xl mx-auto">
          <!-- Welcome Section -->
          <div class="mb-8 animate-fadeIn">
            <h1 class="text-4xl font-black text-white mb-2">Welcome back, {{ clientProfile()?.firstName }}! 👋</h1>
            <p class="text-slate-400">Here's your fitness overview for today</p>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <!-- Active Subscription -->
            <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:border-sky-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/20 animate-slideDown" style="animation-delay: 0s;">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-slate-400 text-sm font-medium uppercase tracking-wide">Active Subscription</p>
                  <p class="text-4xl font-black text-sky-400 mt-3">{{ activeSubscription() ? '✓' : '—' }}</p>
                  <p class="text-xs text-slate-500 mt-2">{{ subscriptionName() || 'None' }}</p>
                </div>
                <div class="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Workouts This Week -->
            <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20 animate-slideDown" style="animation-delay: 0.1s;">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-slate-400 text-sm font-medium uppercase tracking-wide">This Week</p>
                  <p class="text-4xl font-black text-emerald-400 mt-3">{{ workoutsThisWeek() }}</p>
                  <p class="text-xs text-slate-500 mt-2">workouts completed</p>
                </div>
                <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Current Weight -->
            <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/20 animate-slideDown" style="animation-delay: 0.2s;">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-slate-400 text-sm font-medium uppercase tracking-wide">Current Weight</p>
                  <p class="text-4xl font-black text-violet-400 mt-3">{{ currentWeight() || '—' }}</p>
                  <p class="text-xs text-slate-500 mt-2">{{ currentWeight() ? 'kg' : 'not recorded' }}</p>
                </div>
                <div class="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10a7 7 0 1114 0 7 7 0 01-14 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Streak Days -->
            <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20 animate-slideDown" style="animation-delay: 0.3s;">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-slate-400 text-sm font-medium uppercase tracking-wide">Streak</p>
                  <p class="text-4xl font-black text-orange-400 mt-3">{{ currentStreak() }}</p>
                  <p class="text-xs text-slate-500 mt-2">day{{ currentStreak() !== 1 ? 's' : '' }}</p>
                </div>
                <div class="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657L13.414 22.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Workouts + Quick Actions -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Recent Workouts -->
            <div class="lg:col-span-2 relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 animate-slideDown" style="animation-delay: 0.4s;">
              <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                Recent Workouts
              </h2>

              @if (recentWorkouts().length > 0) {
                <div class="space-y-3">
                  @for (workout of recentWorkouts(); track $index) {
                    <div class="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20 animate-slideUp" [style.animation-delay]="($index * 0.05) + 's'">
                      <div>
                        <p class="font-semibold text-white text-sm">{{ workout.programDayName }}</p>
                        <p class="text-xs text-slate-400 mt-1">{{ formatDate(workout.completedAt) }}</p>
                      </div>
                      <div class="flex items-center gap-4 text-right">
                        <div>
                          <p class="text-lg font-bold text-sky-400">{{ workout.numberOfExercises }}</p>
                          <p class="text-xs text-slate-500">exercises</p>
                        </div>
                        <div>
                          <p class="text-lg font-bold text-emerald-400">{{ workout.durationMinutes }}</p>
                          <p class="text-xs text-slate-500">min</p>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="flex flex-col items-center justify-center py-12 text-center">
                  <svg class="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p class="text-slate-400 text-sm">No workouts yet</p>
                  <p class="text-slate-500 text-xs mt-1">Start your first workout to see it here</p>
                </div>
              }
            </div>

            <!-- Quick Actions -->
            <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 animate-slideDown" style="animation-delay: 0.5s;">
              <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <svg class="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Quick Actions
              </h2>

              <div class="space-y-3">
                <button
                  (click)="navigateTo('/workout')"
                  class="w-full relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 p-1 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/50 active:scale-95">
                  <div class="relative bg-slate-900 rounded-[6px] px-4 py-3 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all font-semibold text-white text-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Start Workout
                  </div>
                </button>

                <button
                  (click)="openUpdateWeightModal()"
                  class="w-full relative overflow-hidden rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 p-1 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/50 active:scale-95">
                  <div class="relative bg-slate-900 rounded-[6px] px-4 py-3 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all font-semibold text-white text-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10a7 7 0 1114 0 7 7 0 01-14 0z"></path>
                    </svg>
                    Update Weight
                  </div>
                </button>

                <button
                  (click)="navigateTo('/programs')"
                  class="w-full relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 p-1 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50 active:scale-95">
                  <div class="relative bg-slate-900 rounded-[6px] px-4 py-3 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all font-semibold text-white text-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    Browse Programs
                  </div>
                </button>

                <button
                  (click)="navigateTo('/packages')"
                  class="w-full relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 p-1 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/50 active:scale-95">
                  <div class="relative bg-slate-900 rounded-[6px] px-4 py-3 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all font-semibold text-white text-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Browse Packages
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
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
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private workoutHistoryService = inject(WorkoutHistoryService);

  sidebarOpen = signal(false);
  clientProfile = signal<any>({ firstName: 'User' });
  activeSubscription = signal(false);
  subscriptionName = signal('');
  currentWeight = signal<number | string>('');

  // Get stats from WorkoutHistoryService
  workoutStats = this.workoutHistoryService.stats;

  // Computed signals for dashboard display
  workoutsThisWeek = computed(() => {
    // Calculate workouts completed in the last 7 days
    const stats = this.workoutStats();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return this.workoutHistoryService.history().filter(w => {
      const workoutDate = new Date(w.completedAt);
      return workoutDate >= oneWeekAgo;
    }).length;
  });

  currentStreak = computed(() => {
    return this.workoutStats().currentStreak;
  });

  totalWorkouts = computed(() => {
    return this.workoutStats().totalWorkouts;
  });

  totalMinutes = computed(() => {
    return this.workoutStats().totalDurationMinutes;
  });

  totalProgramDays = computed(() => {
    return this.workoutStats().totalProgramDays;
  });

  lastWorkoutDate = computed(() => {
    return this.workoutStats().lastWorkoutDate;
  });

  // Recent workouts for display (last 5)
  recentWorkouts = computed(() => {
    return this.workoutHistoryService.history().slice(0, 5);
  });

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.clientProfile.set({
        firstName: user.name || 'User',
        profileImageUrl: user.profilePhotoUrl
      });
    }

    // Dashboard data loading can be implemented here
    this.activeSubscription.set(true);
    this.subscriptionName.set('Active Package');
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  openUpdateWeightModal(): void {
    alert('Update weight feature coming soon!');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
