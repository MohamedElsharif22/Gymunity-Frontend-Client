import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Exercise {
  programDayId: number;
  exerciseId: number;
  orderIndex: number;
  sets: string;
  reps: string;
  restSeconds: number;
  tempo?: string;
  rpe?: string;
  percent1RM?: string;
  notes?: string;
  videoUrl?: string;
  exerciseDataJson?: string;
  excersiceName: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  videoDemoUrl?: string;
  thumbnailUrl?: string;
  isCustom: boolean;
  trainerId?: string;
}

export interface ProgramDay {
  id: number;
  programWeekId: number;
  dayNumber: number;
  title: string;
  notes: string;
  exercises?: Exercise[];
}

export interface ProgramWeek {
  id: number;
  programId: number;
  weekNumber: number;
  title?: string;
  days?: ProgramDay[];
}

export interface Program {
  id: number;
  title: string;
  description: string;
  type: string;
  durationWeeks: number;
  totalExercises: number;
  price: number;
  isPublic: boolean;
  maxClients: number;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
  trainerProfileId: number;
  trainerUserName?: string;
  trainerHandle?: string;
  weeks?: ProgramWeek[];
}

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private readonly apiService = inject(ApiService);
  /**
   * Get all available programs
   */
  getPrograms(): Observable<Program[]> {
    return this.apiService.get<Program[]>('/api/client/ClientPrograms');
  }

  /**
   * Get program by ID
   */
  getProgramById(programId: number): Observable<Program> {
    return this.apiService.get<Program>(`/api/client/ClientPrograms/${programId}`);
  }

  /**
   * Get weeks for a program (backend-driven)
   */
  getProgramWeeks(programId: number): Observable<ProgramWeek[]> {
    return this.apiService.get<ProgramWeek[]>(`/api/client/ClientPrograms/${programId}/weeks`);
  }

  /**
   * Get days for a specific program week (backend-driven)
   * Returns array of ProgramDay with real DB ids (ProgramDayId)
   */
  getProgramDaysByWeek(programWeekId: number): Observable<ProgramDay[]> {
    return this.apiService.get<ProgramDay[]>(`/api/client/ClientPrograms/${programWeekId}/days`);
  }

  /**
   * Get exercises (and day info) for a specific day
   */
  getExercisesByDayId(dayId: number): Observable<ProgramDay> {
    return this.apiService.get<ProgramDay>(`/api/client/ClientPrograms/days/${dayId}`);
  }

  /**
   * Get a specific exercise by ID
   */
  getExerciseById(exerciseId: number): Observable<Exercise> {
    return this.apiService.get<Exercise>(`/api/client/exercises/${exerciseId}`);
  }

  /**
   * Get user's active program from their subscription
   */
  getActiveProgram(): Observable<Program> {
    return this.apiService.get<Program>('/api/client/ClientPrograms/active');
  }

  /**
   * Get program day details with exercises
   */
  getProgramDay(programId: number, dayId: number): Observable<ProgramDay> {
    return this.apiService.get<ProgramDay>(`/api/client/ClientPrograms/${programId}/days/${dayId}`);
  }
}
