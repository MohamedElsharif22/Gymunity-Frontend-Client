import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientLogsService } from '../../../core/services/client-logs.service';
import { ClientProfileService } from '../../../core/services/client-profile.service';
import { ClientProgramsService } from '../../programs/services/client-programs.service';
import { BodyStateLogResponse, WorkoutLogResponse, ClientProfileDashboardResponse, ProgramResponse } from '../../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-2">Welcome back! Here's your fitness overview.</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          <p class="text-gray-600 mt-4">Loading your dashboard...</p>
        </div>
      } @else {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <!-- Active Subscriptions -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm font-medium">Active Subscriptions</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ dashboardData()?.summary?.activeSubscriptionCount || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Workouts This Week -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm font-medium">Workouts This Week</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ dashboardData()?.summary?.totalWorkouts || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Current Weight -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm font-medium">Current Weight</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">
                  @if (lastBodyLog()) {
                    {{ lastBodyLog()?.weightKg }}
                  } @else {
                    <span class="text-gray-400">--</span>
                  }
                  @if (lastBodyLog()) {
                    <span class="text-lg ml-1">kg</span>
                  }
                </p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10a7 7 0 1114 0 7 7 0 01-14 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Workout Streak -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm font-medium">Workout Streak</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ dashboardData()?.metrics?.workoutCompletionRate || 0 }}<span class="text-lg">%</span></p>
              </div>
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657L13.414 22.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Recent Workouts -->
          <div class="lg:col-span-2 card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900">Recent Workouts</h2>
              <a routerLink="/workout-logs" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                View All →
              </a>
            </div>
            <div class="space-y-3">
              @if (recentWorkouts().length > 0) {
                @for (workout of recentWorkouts(); track workout.id) {
                  <div class="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer" [routerLink]="['/workout-logs', workout.id]">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <p class="font-semibold text-gray-900">{{ workout.programDayName || 'Workout Session' }}</p>
                        <p class="text-sm text-gray-600 mt-1">{{ formatDate(workout.completedAt) }}</p>
                        @if (workout.notes) {
                          <p class="text-sm text-gray-500 mt-2 line-clamp-2">{{ workout.notes }}</p>
                        }
                      </div>
                      <div class="text-right ml-4">
                        @if (workout.durationMinutes) {
                          <p class="text-lg font-semibold text-sky-600">{{ workout.durationMinutes }}<span class="text-sm">m</span></p>
                        }
                      </div>
                    </div>
                  </div>
                }
              } @else {
                <div class="text-center py-8">
                  <p class="text-gray-500 mb-3">No recent workouts yet.</p>
                  <a routerLink="/workout-logs/add" class="text-sky-600 hover:underline font-medium">
                    Log your first workout →
                  </a>
                </div>
              }
            </div>
          </div>

          <!-- Quick Actions & Alerts -->
          <div class="space-y-6">
            <!-- Quick Actions -->
            <div class="card">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div class="space-y-3">
                <a routerLink="/workout-logs/add" class="w-full btn-primary text-center py-2 rounded block">
                  📋 Log Workout
                </a>
                <a routerLink="/body-state/add" class="w-full btn-secondary text-center py-2 rounded block">
                  ⚖️ Update Weight
                </a>
                <a routerLink="/programs" class="w-full btn-outline text-center py-2 rounded block">
                  📚 Browse Programs
                </a>
              </div>
            </div>

            <!-- Onboarding Status -->
            @if (!isOnboardingComplete()) {
              <div class="card border-amber-200 bg-amber-50">
                <div class="flex items-start">
                  <div class="text-2xl mr-3">⚡</div>
                  <div class="flex-1">
                    <h3 class="font-bold text-amber-900">Complete Your Profile</h3>
                    <p class="text-sm text-amber-800 mt-1">Finish the onboarding process to unlock personalized recommendations.</p>
                    <a routerLink="/onboarding" class="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 inline-block">
                      Continue →
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Active Programs Section -->
        <div class="mt-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">📚 Active Programs</h2>
            <a routerLink="/programs" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
              View All →
            </a>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @if (activePrograms().length > 0) {
              @for (program of activePrograms(); track program.id) {
                <div class="card hover:shadow-lg transition cursor-pointer" [routerLink]="['/programs', program.id]">
                  <div class="flex flex-col h-full">
                    <!-- Program Header -->
                    <div class="mb-3">
                      @if (program.thumbnailUrl) {
                        <img [src]="program.thumbnailUrl" alt="{{ program.title }}" class="w-full h-32 object-cover rounded-lg mb-3">
                      }
                      <h3 class="font-bold text-gray-900 text-lg">{{ program.title }}</h3>
                      <p class="text-xs text-sky-600 font-medium">{{ program.trainerUserName || 'By Trainer' }}</p>
                    </div>
                    
                    <!-- Program Description -->
                    <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ program.description }}</p>
                    
                    <!-- Program Details -->
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between text-gray-700">
                        <span>Duration:</span>
                        <span class="font-semibold">{{ program.durationWeeks }} weeks</span>
                      </div>
                      <div class="flex justify-between text-gray-700">
                        <span>Type:</span>
                        <span class="font-semibold capitalize">{{ program.type }}</span>
                      </div>
                    </div>

                    <!-- Start Button -->
                    <div class="mt-auto pt-4">
                      <a [routerLink]="['/programs', program.id]" class="inline-block w-full text-center bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium py-2 rounded transition">
                        View Details →
                      </a>
                    </div>
                  </div>
                </div>
              }
            } @else {
              <div class="col-span-full">
                <div class="card text-center py-12">
                  <p class="text-gray-500 mb-3">No active programs yet.</p>
                  <a routerLink="/programs" class="text-sky-600 hover:underline font-medium">
                    Browse available programs →
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  // Signals for reactive state management
  dashboardData = signal<ClientProfileDashboardResponse | null>(null);
  lastBodyLog = signal<BodyStateLogResponse | null>(null);
  recentWorkouts = signal<WorkoutLogResponse[]>([]);
  activePrograms = signal<ProgramResponse[]>([]);
  isLoading = signal(true);
  isOnboardingComplete = signal(false);

  constructor(
    private clientLogsService: ClientLogsService,
    private clientProfileService: ClientProfileService,
    private clientProgramsService: ClientProgramsService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  /**
   * Load all dashboard data from API
   * Uses ClientProfileService to fetch dashboard summary and metrics
   */
  private loadDashboardData() {
    this.isLoading.set(true);

    // Fetch dashboard data with summary and metrics
    this.clientProfileService.getDashboard().subscribe({
      next: (data: ClientProfileDashboardResponse) => {
        this.dashboardData.set(data);
        // Load recent activity if available, otherwise fetch from service
        if (!data.recentActivity || data.recentActivity.length === 0) {
          this.loadRecentWorkoutsFromService();
        }
        this.loadLastBodyState();
        this.checkOnboardingStatus();
        this.loadActivePrograms();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('[Dashboard] Error loading dashboard data:', error);
        this.isLoading.set(false);
        // Load fallback data from individual services
        this.loadFallbackData();
      }
    });
  }

  /**
   * Load recent workouts from ClientLogsService
   */
  private loadRecentWorkoutsFromService() {
    this.clientLogsService.getWorkoutLogs().subscribe({
      next: (workouts: WorkoutLogResponse[]) => {
        this.recentWorkouts.set(workouts.slice(0, 5) || []);
      },
      error: (error) => {
        console.warn('[Dashboard] Could not load recent workouts:', error);
      }
    });
  }

  /**
   * Load last body state log for weight display
   */
  private loadLastBodyState() {
    this.clientLogsService.getLastBodyStateLog().subscribe({
      next: (log: BodyStateLogResponse) => {
        this.lastBodyLog.set(log);
      },
      error: (error) => {
        console.warn('[Dashboard] Could not load body state log:', error);
      }
    });
  }

  /**
   * Check if onboarding is completed
   */
  private checkOnboardingStatus() {
    this.clientLogsService.isOnboardingCompleted().subscribe({
      next: (isCompleted: boolean) => {
        this.isOnboardingComplete.set(isCompleted);
      },
      error: (error) => {
        console.warn('[Dashboard] Could not check onboarding status:', error);
      }
    });
  }

  /**
   * Load active programs for the client
   */
  private loadActivePrograms() {
    this.clientProgramsService.getActivePrograms().subscribe({
      next: (programs: ProgramResponse[]) => {
        this.activePrograms.set(programs.slice(0, 6) || []);
      },
      error: (error) => {
        console.warn('[Dashboard] Could not load active programs:', error);
      }
    });
  }

  /**
   * Load data from individual services as fallback
   */
  private loadFallbackData() {
    this.clientLogsService.getLastBodyStateLog().subscribe({
      next: (log: BodyStateLogResponse) => {
        this.lastBodyLog.set(log);
      },
      error: () => {
        // Silent error handling
      }
    });

    this.clientLogsService.getWorkoutLogs().subscribe({
      next: (workouts: WorkoutLogResponse[]) => {
        this.recentWorkouts.set(workouts.slice(0, 5) || []);
      },
      error: () => {
        // Silent error handling
      }
    });
  }

  /**
   * Format date string to readable format
   * @param dateStr - ISO date string
   * @returns Formatted date string
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return '--';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--';
    }
  }
}
