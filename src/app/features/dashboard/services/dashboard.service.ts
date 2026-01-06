import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, retry, shareReplay } from 'rxjs/operators';
import { ClientProfileService } from '../../../core/services/client-profile.service';
import { ClientLogsService } from '../../../core/services/client-logs.service';
import { ProgramService, Program } from '../../programs/services/program.service';
import { SubscriptionService } from '../../memberships/services/subscription.service';
import {
  ClientProfileDashboardResponse,
  BodyStateLogResponse,
  WorkoutLogResponse
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

  // Cache for dashboard data
  private dashboardCache$?: Observable<DashboardData>;
  private cacheTimestamp?: number;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
      activePrograms: this.programsService.getPrograms().pipe(
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
      subscriptions: this.subscriptionService.getClientSubscriptions().pipe(
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
   * Attempts multiple approaches to ensure data is loaded
   */
  loadDashboardDataWithFallback(): Observable<DashboardData> {
    return this.loadDashboardData().pipe(
      catchError(err => {
        console.error('[DashboardService] Primary load failed, attempting fallback:', err);
        return this.loadIndividualServices();
      })
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
      activePrograms: this.programsService.getPrograms().pipe(
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
   */
  private processDashboardData(data: any): DashboardData {
    // Calculate actual subscription count from fetched subscriptions
    const activeSubscriptionCount = data.subscriptions?.length || 0;
    
    // Update dashboard summary with real subscription count
    if (data.dashboard?.summary) {
      data.dashboard.summary.activeSubscriptionCount = activeSubscriptionCount;
    }
    
    return {
      dashboard: data.dashboard,
      lastBodyLog: data.lastBodyLog,
      recentWorkouts: data.recentWorkouts || [],
      activePrograms: data.activePrograms || [],
      isOnboardingComplete: data.isOnboardingComplete ?? true
    };
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