import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ProgramResponse,
  ProgramWeekResponse,
  ProgramDayResponse
} from '../../../core/models';

/**
 * Client Programs Service
 * Handles API calls to retrieve authenticated user's enrolled programs
 * Follows Angular best practices with providedIn: 'root' and inject()
 *
 * Base endpoint: /api/client/programs
 * All endpoints require authentication (handled by AuthInterceptor)
 */
@Injectable({
  providedIn: 'root'
})
export class ClientProgramsService {
  private readonly apiService = inject(ApiService);

  // ==================== Programs ====================

  /**
   * Get all active programs available to the authenticated user
   * GET /api/client/programs/
   *
   * @returns Observable<ProgramResponse[]> - List of programs
   * @throws 401 Unauthorized if user not authenticated
   * @throws 400 Bad Request on server error
   */
  getActivePrograms(): Observable<ProgramResponse[]> {
    return this.apiService.get<ProgramResponse[]>('/api/client/programs');
  }

  /**
   * Get a specific program by ID
   * GET /api/client/programs/{programId}
   *
   * @param programId - The ID of the program to retrieve
   * @returns Observable<ProgramResponse> - Program details
   * @throws 401 Unauthorized if user not authenticated or not authorized to access program
   * @throws 400 Bad Request on server error
   */
  getProgramById(programId: string | number): Observable<ProgramResponse> {
    return this.apiService.get<ProgramResponse>(`/api/client/programs/${programId}`);
  }

  // ==================== Program Weeks ====================

  /**
   * Get all weeks for a specific program
   * GET /api/client/programs/{programId}/weeks
   *
   * @param programId - The ID of the program
   * @returns Observable<ProgramWeekResponse[]> - List of weeks in the program
   * @throws 401 Unauthorized if user not authenticated or not authorized to access program
   * @throws 400 Bad Request on server error
   */
  getProgramWeeks(programId: string | number): Observable<ProgramWeekResponse[]> {
    return this.apiService.get<ProgramWeekResponse[]>(
      `/api/client/programs/${programId}/weeks`
    );
  }

  // ==================== Program Days ====================

  /**
   * Get all days for a specific week within a program
   * GET /api/client/programs/{weekId}/days
   *
   * NOTE: The route parameter is weekId (not programId), which is the unique identifier of a week
   *
   * @param weekId - The ID of the program week
   * @returns Observable<ProgramDayResponse[]> - List of days in the week
   * @throws 401 Unauthorized if user not authenticated or not authorized to access week
   * @throws 400 Bad Request on server error
   */
  getDaysByWeekId(weekId: string | number): Observable<ProgramDayResponse[]> {
    return this.apiService.get<ProgramDayResponse[]>(
      `/api/client/programs/${weekId}/days`
    );
  }

  /**
   * Get a specific program day by ID
   * GET /api/client/programs/days/{dayId}
   *
   * @param dayId - The ID of the program day
   * @returns Observable<ProgramDayResponse> - Day details with exercises
   * @throws 401 Unauthorized if user not authenticated or not authorized to access day
   * @throws 400 Bad Request on server error
   */
  getDayById(dayId: string | number): Observable<ProgramDayResponse> {
    return this.apiService.get<ProgramDayResponse>(
      `/api/client/programs/days/${dayId}`
    );
  }
}
