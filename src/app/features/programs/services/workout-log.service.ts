import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WorkoutLogRequest {
  ProgramDayId: number;
  CompletedAt: string;
  Notes?: string;
  DurationMinutes?: number;
  ExercisesLoggedJson: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutLogService {
  constructor(private http: HttpClient) {}

  saveWorkoutLog(payload: WorkoutLogRequest): Observable<any> {
    return this.http.post('/api/client/WorkoutLog', payload);
  }
}
