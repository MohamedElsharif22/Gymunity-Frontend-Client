import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { WorkoutLog, CreateWorkoutLogRequest, UpdateWorkoutLogRequest, BodyStateLog, CreateBodyStateLogRequest } from '../../../core/models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WorkoutLogService {
  constructor(private apiService: ApiService) {}

  // Workout Log
  addWorkoutLog(request: CreateWorkoutLogRequest): Observable<WorkoutLog> {
    return this.apiService.post<WorkoutLog>('/api/client/WorkoutLog', request);
  }

  getWorkoutLogById(logId: number): Observable<WorkoutLog> {
    return this.apiService.get<WorkoutLog>(`/api/client/WorkoutLog/${logId}`);
  }

  updateWorkoutLog(logId: number, request: UpdateWorkoutLogRequest): Observable<WorkoutLog> {
    return this.apiService.put<WorkoutLog>(`/api/client/WorkoutLog/${logId}`, request);
  }

  deleteWorkoutLog(logId: number): Observable<any> {
    return this.apiService.delete<any>(`/api/client/WorkoutLog/${logId}`);
  }

  getMyWorkoutLogs(pageNumber: number = 1, pageSize: number = 30): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.apiService.get<any>('/api/client/WorkoutLog', params);
  }

  // Body State Log
  addBodyStateLog(request: CreateBodyStateLogRequest): Observable<BodyStateLog> {
    return this.apiService.post<BodyStateLog>('/api/client/BodyStateLog', request);
  }

  getStateLogs(): Observable<BodyStateLog[]> {
    return this.apiService.get<BodyStateLog[]>('/api/client/BodyStateLog');
  }

  getLastStateLog(): Observable<BodyStateLog> {
    return this.apiService.get<BodyStateLog>('/api/client/BodyStateLog/last');
  }
}
