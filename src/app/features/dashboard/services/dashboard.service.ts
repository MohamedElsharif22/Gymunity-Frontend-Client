import { Injectable, inject, effect } from '@angular/core';
import { Observable, forkJoin, of, merge, Subject } from 'rxjs';
import { map, catchError, retry, shareReplay, switchMap, startWith, tap } from 'rxjs/operators';
import { ClientProfileService } from '../../../core/services/client-profile.service';
import { ClientLogsService } from '../../../core/services/client-logs.service';
import { ProgramService, Program } from '../../programs/services/program.service';
import { SubscriptionService } from '../../memberships/services/subscription.service';
import { WorkoutHistoryService } from '../../workout/services/workout-history.service';
import {
  ClientProfileDashboardResponse,
  BodyStateLogResponse,
  WorkoutLogResponse,
  ProgramResponse
} from '../../../core/models';

export interface DashboardData {
  dashboard: ClientProfileDashboardResponse;
  lastBodyLog: BodyStateLogResponse | null;
  recentWorkouts: WorkoutLogResponse[];
  activePrograms: Program[];
  isOnboardingComplete: boolean;
}

/**
 * Dashboard Service
 * Centralized service for managing all dashboard-related data
 * Provides efficient data loading with fallback strategies and caching
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly clientProfileService = inject(ClientProfileService);
  private readonly clientLogsService = inject(ClientLogsService);
  private readonly programsService = inject(ProgramService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly workoutHistoryService = inject(WorkoutHistoryService);

  // Cache for dashboard data
  private dashboardCache$?: Observable<DashboardData>;
  private cacheTimestamp?: number;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Subject to trigger metric updates when workout history changes
  private workoutHistoryUpdate$ = new Subject<void>();
  // Subject to trigger subscription count updates
  private subscriptionUpdate$ = new Subject<void>();

  constructor() {
    // Monitor WorkoutHistoryService for changes and emit updates
    effect(() => {
      // Access the history signal to create a dependency
      this.workoutHistoryService.history();
      // Trigger metric update whenever history changes
      this.workoutHistoryUpdate$.next();
    });

    // Periodically check for subscription changes every 5 seconds
    // This polls while user is on dashboard
    setInterval(() => {
      this.subscriptionUpdate$.next();
    }, 5000);
  }

  /**
   * Load complete dashboard data with intelligent caching
   * Returns cached data if still valid, otherwise fetches fresh data
   */
  loadDashboardData(): Observable<DashboardData> {
    const now = Date.now();

    // Return cached data if valid
    if (this.dashboardCache$ && this.cacheTimestamp && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('[DashboardService] Returning cached data');
      return this.dashboardCache$;
    }

    // Fetch fresh data
    console.log('[DashboardService] Fetching fresh dashboard data');
    this.dashboardCache$ = forkJoin({
      dashboard: this.clientProfileService.getDashboard().pipe(
        retry(1),
        catchError(err => {
          console.error('[DashboardService] Error loading dashboard summary:', err);
          return of(this.getEmptyDashboard());
        })
      ),
      lastBodyLog: this.clientLogsService.getLastBodyStateLog().pipe(
        catchError(err => {
          console.warn('[DashboardService] Error loading body log:', err);
          return of(null);
        })
      ),
      recentWorkouts: this.clientLogsService.getWorkoutLogs().pipe(
        map(workouts => workouts.slice(0, 5)),
        catchError(err => {
          console.warn('[DashboardService] Error loading workouts:', err);
          return of([]);
        })
      ),
      activePrograms: this.programsService.getActivePrograms().pipe(
        catchError((err: any) => {
          console.warn('[DashboardService] Error loading active programs, falling back:', err);
          return this.programsService.getPrograms();
        }),
        map(programs => programs.slice(0, 6)),
        catchError(err => {
          console.warn('[DashboardService] Error loading programs:', err);
          return of([]);
        })
      ),
      isOnboardingComplete: this.clientLogsService.isOnboardingCompleted().pipe(
        catchError(err => {
          console.warn('[DashboardService] Error checking onboarding:', err);
          return of(true);
        })
      ),
      subscriptions: this.subscriptionService.getClientSubscriptions('Active').pipe(
        catchError(err => {
          console.warn('[DashboardService] Error loading subscriptions:', err);
          return of([]);
        })
      )
    }).pipe(
      map(data => this.processDashboardData(data)),
      shareReplay(1) // Share the result among multiple subscribers
    );

    this.cacheTimestamp = now;
    return this.dashboardCache$;
  }

  /**
   * Load dashboard with comprehensive fallback strategy
   * REAL-TIME: Subscribes to WorkoutHistoryService changes for instant metric updates
   * REAL-TIME: Periodically fetches subscription updates every 5 seconds
   * Whenever a workout is completed or subscription changes, updates display immediately
   */
  loadDashboardDataWithFallback(): Observable<DashboardData> {
    return this.loadDashboardData().pipe(
      switchMap((initialData: DashboardData) => {
        // Combine multiple update sources
        return merge(
          of(null), // Emit immediately for initial data (null signals use initialData)
          this.workoutHistoryUpdate$, // Emit whenever workout history changes
          this.subscriptionUpdate$ // Emit every 5 seconds to check subscriptions
        ).pipe(
          switchMap((trigger) => {
            // If trigger is null, use initial subscriptions; otherwise fetch fresh
            if (trigger === null) {
              console.log('[DashboardService] Using initial subscriptions from load');
              return of(initialData.dashboard?.summary?.activeSubscriptionCount || 0);
            }

            // Otherwise fetch fresh subscriptions
            console.log('[DashboardService] Fetching fresh subscriptions...');
            return this.subscriptionService.getClientSubscriptions('Active').pipe(
              catchError(() => of([])),
              map(subs => subs?.length || 0)
            );
          }),
          map((subscriptionCount) => {
            // Recompute frontend metrics with current history
            const frontendMetrics = this.computeFrontendMetrics(initialData.activePrograms || []);

            // Create updated dashboard data with new metrics and subscription count
            const updatedDashboard = {
              ...initialData.dashboard,
              summary: {
                ...initialData.dashboard.summary,
                totalWorkouts: frontendMetrics.workoutsLogged,
                activeSubscriptionCount: subscriptionCount
              },
              metrics: {
                ...initialData.dashboard.metrics,
                workoutCompletionRate: frontendMetrics.completionRate,
                currentStreak: frontendMetrics.currentStreak
              }
            };

            console.log('[DashboardService] 🔄 Real-time metrics updated:', {
              workoutsLogged: frontendMetrics.workoutsLogged,
              completionRate: frontendMetrics.completionRate,
              streak: frontendMetrics.currentStreak,
              activeSubscriptions: subscriptionCount
            });

            return {
              ...initialData,
              dashboard: updatedDashboard
            } as DashboardData;
          }),
          startWith(initialData) // Emit initial data first
        );
      }),
      catchError((err: any) => {
        console.error('[DashboardService] Primary load failed, attempting fallback:', err);
        return this.loadIndividualServices();
      }),
      shareReplay(1) // Share result with all subscribers
    );
  }

  /**
   * Load data from individual services as fallback
   * Used when aggregate loading fails
   */
  private loadIndividualServices(): Observable<DashboardData> {
    console.log('[DashboardService] Loading from individual services');

    return forkJoin({
      dashboard: of(this.getEmptyDashboard()),
      lastBodyLog: this.clientLogsService.getLastBodyStateLog().pipe(
        catchError(() => of(null))
      ),
      recentWorkouts: this.clientLogsService.getWorkoutLogs().pipe(
        map(workouts => workouts.slice(0, 5)),
        catchError(() => of([]))
      ),
      activePrograms: this.programsService.getActivePrograms().pipe(
        catchError(() => this.programsService.getPrograms()),
        map(programs => programs.slice(0, 6)),
        catchError(() => of([]))
      ),
      isOnboardingComplete: of(true)
    }).pipe(
      map(data => this.processDashboardData(data))
    );
  }

  /**
   * Process and normalize dashboard data
   * Merges frontend workout history metrics with backend dashboard data
   */
  private processDashboardData(data: any): DashboardData {
    // Calculate actual subscription count from fetched subscriptions
    const activeSubscriptionCount = data.subscriptions?.length || 0;

    // Update dashboard summary with real subscription count
    if (data.dashboard?.summary) {
      data.dashboard.summary.activeSubscriptionCount = activeSubscriptionCount;
    }

    // Compute frontend metrics from WorkoutHistoryService
    const frontendMetrics = this.computeFrontendMetrics(data.activePrograms || []);

    // Update dashboard with frontend metrics (primary source of truth)
    if (data.dashboard?.summary) {
      data.dashboard.summary.totalWorkouts = frontendMetrics.workoutsLogged;
    }

    if (data.dashboard?.metrics) {
      data.dashboard.metrics.workoutCompletionRate = frontendMetrics.completionRate;
      // Store streak in metrics
      (data.dashboard.metrics as any).currentStreak = frontendMetrics.currentStreak;
    }

    console.log('[DashboardService] Frontend metrics computed:', {
      workoutsLogged: frontendMetrics.workoutsLogged,
      totalAvailableDays: frontendMetrics.totalAvailableDays,
      completionRate: frontendMetrics.completionRate,
      currentStreak: frontendMetrics.currentStreak,
      timestamp: new Date().toISOString()
    });

    return {
      dashboard: data.dashboard,
      lastBodyLog: data.lastBodyLog,
      recentWorkouts: data.recentWorkouts || [],
      activePrograms: data.activePrograms || [],
      isOnboardingComplete: data.isOnboardingComplete ?? true
    };
  }

  /**
   * Compute metrics from frontend workout history cache
   * This is the primary source of truth for workout metrics
   */
  private computeFrontendMetrics(activePrograms: ProgramResponse[]): {
    workoutsLogged: number;
    totalAvailableDays: number;
    completionRate: number;
    currentStreak: number;
  } {
    // Get completed workouts from frontend cache
    const completedWorkouts = this.workoutHistoryService.history();
    const workoutsLogged = completedWorkouts.length;
    const currentStreak = this.workoutHistoryService.streak();

    // Calculate total available days from active programs
    const totalAvailableDays = this.calculateTotalProgramDays(activePrograms);

    // Calculate completion rate
    let completionRate = 0;
    if (totalAvailableDays > 0) {
      completionRate = Math.round((workoutsLogged / totalAvailableDays) * 100);
      // Clamp between 0 and 100
      completionRate = Math.max(0, Math.min(100, completionRate));
    }

    return {
      workoutsLogged,
      totalAvailableDays,
      completionRate,
      currentStreak
    };
  }

  /**
   * Calculate total available days from active programs
   * Assumes 4 workout days per week
   */
  private calculateTotalProgramDays(programs: ProgramResponse[]): number {
    return programs.reduce((total, program) => {
      const daysPerWeek = 4; // Standard assumption: 4 days/week
      const totalDays = (program.durationWeeks || 0) * daysPerWeek;
      return total + totalDays;
    }, 0);
  }

  /**
   * Get empty dashboard structure as fallback
   */
  private getEmptyDashboard(): ClientProfileDashboardResponse {
    return {
      summary: {
        activeSubscriptionCount: 0,
        totalWorkouts: 0,
        completionPercentage: 0,
        profileId: 0,
        userName: 'Guest',
        activeProgramCount: 0
      },
      metrics: {
        workoutCompletionRate: 0,
        averageWorkoutDuration: 0,
        totalExercisesCompleted: 0,
        totalWorkoutMinutes: 0
      },
      recentActivity: []
    } as ClientProfileDashboardResponse;
  }

  /**
   * Clear the dashboard cache
   * Useful when data is updated and fresh data is needed
   */
  clearCache(): void {
    console.log('[DashboardService] Clearing cache');
    this.dashboardCache$ = undefined;
    this.cacheTimestamp = undefined;
  }

  /**
   * Refresh dashboard data
   * Forces a fresh load by clearing cache first
   */
  refreshDashboard(): Observable<DashboardData> {
    this.clearCache();
    return this.loadDashboardData();
  }

  /**
   * Get cached data if available
   * Returns null if no cache exists or cache is expired
   */
  getCachedData(): Observable<DashboardData> | null {
    const now = Date.now();
    if (this.dashboardCache$ && this.cacheTimestamp && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.dashboardCache$;
    }
    return null;
  }

  /**
   * Check if cache is valid
   */
  isCacheValid(): boolean {
    if (!this.cacheTimestamp) return false;
    const now = Date.now();
    return (now - this.cacheTimestamp) < this.CACHE_DURATION;
  }
}
