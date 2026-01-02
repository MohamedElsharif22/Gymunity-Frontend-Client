import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ClientProfileService } from '../../../core/services/client-profile.service';
import { ClientLogsService } from '../../../core/services/client-logs.service';
import { ClientProgramsService } from '../../programs/services/client-programs.service';
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
  activePrograms: ProgramResponse[];
  isOnboardingComplete: boolean;
}

/**
 * Dashboard Service
 * Aggregates all dashboard-related data from various services
 * Provides a single source of truth for dashboard state management
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly clientProfileService = inject(ClientProfileService);
  private readonly clientLogsService = inject(ClientLogsService);
  private readonly clientProgramsService = inject(ClientProgramsService);

  /**
   * Load complete dashboard data
   * Combines profile, logs, programs, and onboarding data
   */
  loadDashboardData(): Observable<DashboardData> {
    return forkJoin({
      dashboard: this.clientProfileService.getDashboard(),
      lastBodyLog: this.clientLogsService.getLastBodyStateLog().pipe(
        catchError(() => new Observable<null>(observer => observer.next(null)))
      ),
      recentWorkouts: this.clientLogsService.getWorkoutLogs().pipe(
        catchError(() => new Observable<WorkoutLogResponse[]>(observer => observer.next([])))
      ),
      activePrograms: this.clientProgramsService.getActivePrograms().pipe(
        catchError(() => new Observable<ProgramResponse[]>(observer => observer.next([])))
      ),
      isOnboardingComplete: new Observable<boolean>(observer => observer.next(true))
    }).pipe(
      map(data => ({
        dashboard: data.dashboard,
        lastBodyLog: data.lastBodyLog,
        recentWorkouts: data.recentWorkouts.slice(0, 5),
        activePrograms: data.activePrograms.slice(0, 6),
        isOnboardingComplete: data.isOnboardingComplete
      }))
    );
  }

  /**
   * Load dashboard with fallback strategy
   * If aggregate load fails, load data individually
   */
  loadDashboardDataWithFallback(): Observable<DashboardData> {
    return this.loadDashboardData().pipe(
      catchError(() => {
        console.warn('[DashboardService] Failed to load aggregated data, using individual loads');
        return forkJoin({
          dashboard: this.clientProfileService.getDashboard().pipe(
            catchError(() => new Observable<ClientProfileDashboardResponse>(observer => 
              observer.next({ summary: { activeSubscriptionCount: 0, totalWorkoutsCount: 0, completionPercentage: 0 } } as any)
            ))
          ),
          lastBodyLog: this.clientLogsService.getLastBodyStateLog().pipe(
            catchError(() => new Observable<null>(observer => observer.next(null)))
          ),
          recentWorkouts: this.clientLogsService.getWorkoutLogs().pipe(
            catchError(() => new Observable<WorkoutLogResponse[]>(observer => observer.next([])))
          ),
          activePrograms: this.clientProgramsService.getActivePrograms().pipe(
            catchError(() => new Observable<ProgramResponse[]>(observer => observer.next([])))
          ),
          isOnboardingComplete: new Observable<boolean>(observer => observer.next(true))
        }).pipe(
          map(data => ({
            dashboard: data.dashboard,
            lastBodyLog: data.lastBodyLog,
            recentWorkouts: data.recentWorkouts.slice(0, 5),
            activePrograms: data.activePrograms.slice(0, 6),
            isOnboardingComplete: data.isOnboardingComplete
          }))
        );
      })
    );
  }
}
