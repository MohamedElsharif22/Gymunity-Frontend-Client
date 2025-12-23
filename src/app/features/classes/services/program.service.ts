import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Program, ProgramWeek, ProgramDay, DayExercise, Exercise } from '../../../core/models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  constructor(private apiService: ApiService) {}

  // Programs
  getAllPrograms(): Observable<Program[]> {
    return this.apiService.get<Program[]>('/api/trainer/Programs');
  }

  getProgramById(programId: number): Observable<Program> {
    return this.apiService.get<Program>(`/api/trainer/Programs/${programId}`);
  }

  searchPrograms(term: string): Observable<Program[]> {
    const params = new HttpParams().set('term', term);
    return this.apiService.get<Program[]>('/api/trainer/Programs', params);
  }

  getProgramsByTrainer(trainerId: string): Observable<Program[]> {
    return this.apiService.get<Program[]>(`/api/trainer/Programs/byTrainer/${trainerId}`);
  }

  // Weeks
  getWeeksByProgram(programId: number): Observable<ProgramWeek[]> {
    return this.apiService.get<ProgramWeek[]>(`/api/trainer/Weeks/by-program/${programId}`);
  }

  getWeekById(weekId: number): Observable<ProgramWeek> {
    return this.apiService.get<ProgramWeek>(`/api/trainer/Weeks/${weekId}`);
  }

  // Days
  getDaysByWeek(weekId: number): Observable<ProgramDay[]> {
    return this.apiService.get<ProgramDay[]>(`/api/trainer/Days/by-week/${weekId}`);
  }

  getDayById(dayId: number): Observable<ProgramDay> {
    return this.apiService.get<ProgramDay>(`/api/trainer/Days/${dayId}`);
  }

  // Exercises
  getExercisesByDay(dayId: number): Observable<DayExercise[]> {
    return this.apiService.get<DayExercise[]>(`/api/trainer/DayExercises/by-day/${dayId}`);
  }

  getExerciseById(exerciseId: number): Observable<DayExercise> {
    return this.apiService.get<DayExercise>(`/api/trainer/DayExercises/${exerciseId}`);
  }
}
