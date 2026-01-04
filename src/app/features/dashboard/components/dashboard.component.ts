import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { WorkoutLogService } from '../../workout/services/workout-log.service';
import { AuthService } from '../../../core/services/auth.service';

interface WorkoutSummary {
  id: number;
  programDayId: number;
  completedAt: string;
  durationMinutes: number;
  exercisesLoggedJson: string;
  programDayName?: string;
  totalReps?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <!-- Fixed Header -->
      <header class="fixed top-0 left-0 right-0 bg-slate-800/80 backdrop-blur-md border-b border-white/10 z-40 animate-slideDown">
        <div class="flex items-center justify-between px-6 py-4 max-w-full">
          <!-- Logo + Sidebar Toggle -->
          <div class="flex items-center gap-4">
            <button
              (click)="toggleSidebar()"
              class="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 group">
              <svg class="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <div class="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
              Gymunity
            </div>
          </div>

          <!-- Avatar Dropdown -->
          <div class="relative group">
            <button class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300">
              @if (clientProfile()?.profileImageUrl) {
                <img [src]="clientProfile()?.profileImageUrl" [alt]="clientProfile()?.firstName" class="w-8 h-8 rounded-full object-cover">
              } @else {
                <div class="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  {{ (clientProfile()?.firstName || 'U')[0] }}
                </div>
              }
              <span class="text-slate-300 text-sm font-medium">{{ clientProfile()?.firstName }}</span>
              <svg class="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div class="absolute right-0 top-12 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              <a routerLink="/profile" class="block px-4 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Profile
              </a>
              <a routerLink="/memberships" class="block px-4 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                My Subscription
              </a>
              <a routerLink="/programs" class="block px-4 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                My Program
              </a>
              <div class="border-t border-white/10 my-2"></div>
              <button (click)="logout()" class="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Sidebar -->
      <aside
        [class.translate-x-0]="sidebarOpen()"
        [class.-translate-x-full]="!sidebarOpen()"
        class="fixed left-0 top-16 bottom-0 w-64 bg-slate-800/90 backdrop-blur-md border-r border-white/10 transition-transform duration-300 z-30">
        <nav class="p-4 space-y-2">
          <a routerLink="/dashboard" [routerLinkActive]="'bg-white/10'" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m2 3l2-3m2 3l2-3m2-4l2 3m-2-3V7m6 0v10m6-10v10m0 0l-2-3m2 3l-2-3"></path>
            </svg>
            Dashboard
          </a>
          <a routerLink="/memberships" [routerLinkActive]="'bg-white/10'" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            My Package
          </a>
          <a routerLink="/programs" [routerLinkActive]="'bg-white/10'" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            My Program
          </a>
          <a routerLink="/workout" [routerLinkActive]="'bg-white/10'" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Workout
          </a>
          <a routerLink="/profile" [routerLinkActive]="'bg-white/10'" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Progress
          </a>
          <a routerLink="/profile" [routerLinkActive]="'bg-white/10'" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Settings
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main [class.ml-64]="sidebarOpen()" class="transition-all duration-300 pt-20 pb-8">
        <div class="max-w-7xl mx-auto px-6">
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
                          <p class="text-lg font-bold text-sky-400">{{ workout.totalReps }}</p>
                          <p class="text-xs text-slate-500">reps</p>
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
  private workoutLogService = inject(WorkoutLogService);
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal(false);
  clientProfile = signal<any>({ firstName: 'User' });
  activeSubscription = signal(false);
  subscriptionName = signal('');
  currentWeight = signal<number | string>('');
  workoutsThisWeek = signal(0);
  currentStreak = signal(0);
  recentWorkouts = signal<WorkoutSummary[]>([]);
  workoutsSignal = signal<WorkoutSummary[]>([]);

  totalWorkouts = computed(() => this.workoutsSignal().length);
  totalMinutes = computed(() => this.workoutsSignal().reduce((acc, w) => acc + (w.durationMinutes || 0), 0));

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

    this.workoutLogService.getWorkoutLogs(1, 50).subscribe({
      next: (response) => {
        const logs = (response as any).data || response || [];
        const workouts: WorkoutSummary[] = Array.isArray(logs) ? logs : [];
        workouts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        
        // Enrich workouts with computed properties
        const enrichedWorkouts = workouts.map(w => ({
          ...w,
          programDayName: `Day ${w.programDayId}`,
          totalReps: this.getTotalRepsFromJson(w.exercisesLoggedJson)
        }));
        
        this.workoutsSignal.set(enrichedWorkouts);

        const last5 = enrichedWorkouts.slice(0, 5);
        this.recentWorkouts.set(last5);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeek = enrichedWorkouts.filter(w => new Date(w.completedAt) > weekAgo).length;
        this.workoutsThisWeek.set(thisWeek);

        this.calculateStreak(enrichedWorkouts);

        this.activeSubscription.set(true);
        this.subscriptionName.set('Active Package');
      },
      error: () => {}
    });
  }

  getTotalRepsFromJson(exercisesJson: string): number {
    try {
      const exercises = JSON.parse(exercisesJson);
      if (!Array.isArray(exercises)) return 0;
      return exercises.reduce((sum, ex) => sum + (ex.totalReps || 0), 0);
    } catch {
      return 0;
    }
  }

  calculateStreak(workouts: WorkoutSummary[]): void {
    if (!workouts || workouts.length === 0) {
      this.currentStreak.set(0);
      return;
    }

    let streak = 1;

    for (let i = 1; i < workouts.length; i++) {
      const current = new Date(workouts[i - 1].completedAt);
      const previous = new Date(workouts[i].completedAt);
      const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        break;
      }
    }

    this.currentStreak.set(streak);
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
