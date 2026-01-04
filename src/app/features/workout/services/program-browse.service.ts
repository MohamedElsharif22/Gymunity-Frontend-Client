import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  trainerUserName: string | null;
  trainerHandle: string | null;
}

export interface ProgramWeek {
  id: number;
  programId: number;
  weekNumber: number;
  title?: string;
  description?: string;
  days?: any[];
}

export interface ProgramDay {
  id: number;
  programWeekId: number;
  dayNumber: number;
  title: string;
  notes: string;
  exercises?: any[];
}

@Injectable({ providedIn: 'root' })
export class ProgramBrowseService {
  private apiUrl = 'https://gymunity-fp-apis.runasp.net/api/client';
  private http = inject(HttpClient);

  getAllPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/ClientPrograms`);
  }

  getProgramWeeks(programId: number): Observable<ProgramWeek[]> {
    return this.http.get<ProgramWeek[]>(`${this.apiUrl}/ClientPrograms/${programId}/weeks`);
  }

  getProgramDays(programId: number): Observable<ProgramDay[]> {
    return this.http.get<ProgramDay[]>(`${this.apiUrl}/ClientPrograms/${programId}/days`);
  }

  getProgramDayExercises(dayId: number): Observable<ProgramDay> {
    return this.http.get<ProgramDay>(`${this.apiUrl}/ClientPrograms/days/${dayId}`);
  }
}
