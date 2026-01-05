import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  CreateBodyStateLogRequest,
  BodyStateLogResponse,
  OnboardingRequest,
  WorkoutLogRequest,
  WorkoutLogResponse
} from '../models/client-logs.model';

@Injectable({
  providedIn: 'root'
})
export class ClientLogsService {
  private apiService = inject(ApiService);
  private apiUrl = '/api/client';

  // ============ Body State Log Methods ============
  addBodyStateLog(payload: CreateBodyStateLogRequest): Observable<BodyStateLogResponse> {
    console.log('[ClientLogsService] Adding body state log:', payload);
    return this.apiService.post<BodyStateLogResponse>(
      `${this.apiUrl}/bodystatelog`,
      payload
    );
  }

  getBodyStateLogs(): Observable<BodyStateLogResponse[]> {
    console.log('[ClientLogsService] Fetching all body state logs');
    return this.apiService.get<BodyStateLogResponse[]>(
      `${this.apiUrl}/bodystatelog`
    );
  }

  getLastBodyStateLog(): Observable<BodyStateLogResponse> {
    console.log('[ClientLogsService] Fetching last body state log');
    return this.apiService.get<BodyStateLogResponse>(
      `${this.apiUrl}/bodystatelog/lastStateLog`
    );
  }

  // ============ Onboarding Methods ============
  completeOnboarding(payload: OnboardingRequest): Observable<void> {
    console.log('[ClientLogsService] Completing onboarding:', payload);
    return this.apiService.put<void>(
      `${this.apiUrl}/onboarding/complete`,
      payload
    );
  }

  isOnboardingCompleted(): Observable<boolean> {
    console.log('[ClientLogsService] Checking onboarding status');
    return this.apiService.get<boolean>(
      `${this.apiUrl}/onboarding/status`
    );
  }

  // ============ Workout Log Methods ============
  addWorkoutLog(payload: WorkoutLogRequest): Observable<WorkoutLogResponse> {
    console.log('[ClientLogsService] Adding workout log:', payload);
    return this.apiService.post<WorkoutLogResponse>(
      `${this.apiUrl}/workoutlog`,
      payload
    );
  }

  getWorkoutLog(id: number): Observable<WorkoutLogResponse> {
    console.log('[ClientLogsService] Fetching workout log:', id);
    return this.apiService.get<WorkoutLogResponse>(
      `${this.apiUrl}/workoutlog/${id}`
    );
  }

  getWorkoutLogs(): Observable<WorkoutLogResponse[]> {
    console.log('[ClientLogsService] Fetching all workout logs');
    return this.apiService.get<WorkoutLogResponse[]>(
      `${this.apiUrl}/workoutlog`
    );
  }
}
