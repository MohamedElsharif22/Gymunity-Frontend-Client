import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Program, ProgramWeek, ProgramDay, DayExercise } from '../../../core/models';
import { HttpParams } from '@angular/common/http';

/**
 * Program Service
 * Handles all program, week, day, and exercise related API calls
 * Follows Angular best practices with providedIn: 'root' and inject()
 */
@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private readonly apiService = inject(ApiService);

  // ==================== Programs ====================

  /**
   * Get all active programs for the current client
   */
  getAllActivePrograms(): Observable<Program[]> {
    return this.apiService.get<Program[]>('/api/client/clientprograms');
  }

  /**
   * Get program by ID
   */
  getProgramById(programId: number): Observable<Program> {
    return this.apiService.get<Program>(`/api/client/clientprograms/${programId}`);
  }

  /**
   * Get all available programs (for discovery)
   */
  getAllPrograms(): Observable<Program[]> {
    return this.apiService.get<Program[]>('/api/homeclient/programs');
  }

  /**
   * Get program by ID (from discovery)
   */
  getProgramByIdPublic(programId: number): Observable<Program> {
    return this.apiService.get<Program>(`/api/homeclient/programs/${programId}`);
  }

  /**
   * Get programs by trainer ID
   */
  getProgramsByTrainer(trainerId: string): Observable<Program[]> {
    return this.apiService.get<Program[]>(`/api/homeclient/programs/by-trainer/${trainerId}`);
  }

  /**
   * Search programs
   */
  searchPrograms(term: string): Observable<Program[]> {
    const params = new HttpParams().set('term', term);
    return this.apiService.get<Program[]>('/api/homeclient/search', params);
  }

  // ==================== Program Weeks ====================

  /**
   * Get all weeks for a program
   */
  getProgramWeeks(programId: number): Observable<ProgramWeek[]> {
    return this.apiService.get<ProgramWeek[]>(`/api/client/clientprograms/${programId}/weeks`);
  }

  // ==================== Program Days ====================

  /**
   * Get all days for a program (not week)
   */
  getProgramDays(programId: number): Observable<ProgramDay[]> {
    console.log('[ProgramService] Fetching days for program:', programId);
    return this.apiService.get<ProgramDay[]>(`/api/client/clientprograms/${programId}/days`);
  }

  /**
   * Get day by ID with exercises
   */
  getDayById(dayId: number): Observable<ProgramDay> {
    console.log('[ProgramService] Fetching day:', dayId);
    return this.apiService.get<ProgramDay>(`/api/client/clientprograms/days/${dayId}`);
  }

  // ==================== Day Exercises ====================

  /**
   * Get exercises for a specific day
   */
  getExercisesByDay(dayId: number): Observable<DayExercise[]> {
    return this.apiService.get<DayExercise[]>(`/api/client/clientprograms/days/${dayId}/exercises`);
  }

  /**
   * Get a specific exercise
   */
  getExerciseById(exerciseId: number): Observable<DayExercise> {
    return this.apiService.get<DayExercise>(`/api/client/clientprograms/exercises/${exerciseId}`);
  }
}

