import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WorkoutLogPayload {
  programDayId: number;
  completedAt: string;
  durationMinutes: number;
  exercisesLoggedJson: string;
}

export interface WorkoutLog {
  id: number;
  programDayId: number;
  completedAt: string;
  durationMinutes: number;
  exercisesLoggedJson: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutLogService {
  private http = inject(HttpClient);
  private apiUrl = '/api/client/WorkoutLog';

  createWorkoutLog(payload: WorkoutLogPayload): Observable<WorkoutLog> {
    return this.http.post<WorkoutLog>(this.apiUrl, payload);
  }

  getWorkoutLogs(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  getWorkoutLogById(id: number): Observable<WorkoutLog> {
    return this.http.get<WorkoutLog>(`${this.apiUrl}/${id}`);
  }

  getWorkoutLogsThisWeek(): Observable<WorkoutLog[]> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return this.http.get<WorkoutLog[]>(`${this.apiUrl}/week?from=${sevenDaysAgo}`);
  }
}
