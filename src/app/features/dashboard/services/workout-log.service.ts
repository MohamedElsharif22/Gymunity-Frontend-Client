import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  WorkoutLog,
  CreateWorkoutLogRequest,
  UpdateWorkoutLogRequest,
  BodyStateLog,
  CreateBodyStateLogRequest,
  PaginatedResponse
} from '../../../core/models';
import { HttpParams } from '@angular/common/http';

/**
 * Workout Log Service
 * Handles all workout logging and body state tracking API calls
 * Follows Angular best practices with providedIn: 'root' and inject()
 */
@Injectable({
  providedIn: 'root'
})
export class WorkoutLogService {
  private readonly apiService = inject(ApiService);

  // ==================== Workout Logs ====================

  /**
   * Create a new workout log entry
   */
  createWorkoutLog(request: CreateWorkoutLogRequest): Observable<WorkoutLog> {
    return this.apiService.post<WorkoutLog>('/api/client/workoutlog', request);
  }

  /**
   * Get all workout logs with pagination
   */
  getWorkoutLogs(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResponse<WorkoutLog>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.apiService.get<PaginatedResponse<WorkoutLog>>('/api/client/workoutlog', params);
  }

  /**
   * Get workout log by ID
   */
  getWorkoutLogById(logId: number): Observable<WorkoutLog> {
    return this.apiService.get<WorkoutLog>(`/api/client/workoutlog/${logId}`);
  }

  /**
   * Update workout log
   */
  updateWorkoutLog(logId: number, request: UpdateWorkoutLogRequest): Observable<WorkoutLog> {
    return this.apiService.put<WorkoutLog>(`/api/client/workoutlog/${logId}`, request);
  }

  /**
   * Delete workout log
   */
  deleteWorkoutLog(logId: number): Observable<any> {
    return this.apiService.delete<any>(`/api/client/workoutlog/${logId}`);
  }

  // ==================== Body State Logs ====================

  /**
   * Create a new body state log entry
   */
  createBodyStateLog(request: CreateBodyStateLogRequest): Observable<BodyStateLog> {
    return this.apiService.post<BodyStateLog>('/api/client/bodystateleg', request);
  }

  /**
   * Get all body state logs
   */
  getBodyStateLogs(): Observable<BodyStateLog[]> {
    return this.apiService.get<BodyStateLog[]>('/api/client/bodystateleg');
  }

  /**
   * Get the last body state log entry
   */
  getLastBodyStateLog(): Observable<BodyStateLog> {
    return this.apiService.get<BodyStateLog>('/api/client/bodystateleg/lastStateLog');
  }
}

