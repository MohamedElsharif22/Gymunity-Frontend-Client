import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import {
  ProgramResponse,
  ProgramWeekResponse,
  ProgramDayResponse
} from '../../../core/models';

/**
 * Program Pagination Response Type
 */
interface ProgramPaginationResponse {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  items: ProgramResponse[];
}

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
   * Supports pagination with optional page and pageSize parameters
   * Default: page 1, pageSize 100 (to get all programs)
   *
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 100)
   * @returns Observable<ProgramResponse[]> - List of programs
   * @throws 401 Unauthorized if user not authenticated
   * @throws 400 Bad Request on server error
   */
  getActivePrograms(page: number = 1, pageSize: number = 100): Observable<ProgramResponse[]> {
    let params = new HttpParams();
    params = params.set('page', page.toString());
    params = params.set('pageSize', pageSize.toString());

    return this.apiService.get<any>('/api/client/clientprograms', { params }).pipe(
      map(response => {
        console.log('[ClientProgramsService] Raw programs response:', response);
        
        // Handle both paginated and non-paginated response formats
        let programs: ProgramResponse[] = [];
        if (Array.isArray(response)) {
          programs = response;
        } else {
          // Handle paginated response (items, data, or totalCount)
          programs = response?.items || response?.data || [];
        }
        
        console.log('[ClientProgramsService] Mapped programs:', programs);
        return programs;
      })
    );
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
    console.log('[ClientProgramsService] Getting program:', programId);
    return this.apiService.get<ProgramResponse>(`/api/client/clientprograms/${programId}`).pipe(
      map(response => {
        console.log('[ClientProgramsService] Program response:', response);
        console.log('[ClientProgramsService] Trainer info - Name:', response.trainerUserName, 'Handle:', response.trainerHandle, 'ProfileId:', response.trainerProfileId);
        return response;
      })
    );
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
      `/api/client/clientprograms/${programId}/weeks`
    );
  }

  // ==================== Program Days ====================

  /**
   * Get all days for a specific week within a program
   * GET /api/client/clientprograms/{weekId}/days
   *
   * Backend endpoint: [HttpGet("{weekId}/days")]
   * Returns all ProgramDayResponse items for the given weekId
   *
   * @param weekId - The ID of the program week
   * @returns Observable<ProgramDayResponse[]> - List of days in the week with exercises
   * @throws 401 Unauthorized if user not authenticated or not authorized
   * @throws 400 Bad Request on server error
   */
  getDaysByWeekId(weekId: string | number): Observable<ProgramDayResponse[]> {
    console.log('[ClientProgramsService] Getting days for week:', weekId);
    return this.apiService.get<any>(
      `/api/client/clientprograms/${weekId}/days`
    ).pipe(
      map((response: any) => {
        console.log('[ClientProgramsService] Days response for week', weekId, ':', response);
        // Backend returns array directly
        if (Array.isArray(response)) {
          console.log(`[ClientProgramsService] Found ${response.length} days for week ${weekId}`);
          return response as ProgramDayResponse[];
        }
        // Fallback for paginated responses
        return (response?.items || response?.data || []) as ProgramDayResponse[];
      })
    );
  }

  /**
   * Get a specific program day by ID
   * GET /api/client/clientprograms/days/{dayId}
   *
   * @param dayId - The ID of the program day
   * @returns Observable<ProgramDayResponse> - Day details with exercises
   * @throws 401 Unauthorized if user not authenticated or not authorized to access day
   * @throws 400 Bad Request on server error
   */
  getDayById(dayId: string | number): Observable<ProgramDayResponse> {
    console.log('[ClientProgramsService] Getting day details:', dayId);
    return this.apiService.get<ProgramDayResponse>(
      `/api/client/clientprograms/days/${dayId}`
    ).pipe(
      map(response => {
        console.log('[ClientProgramsService] Day details response:', response);
        return response;
      })
    );
  }
}
