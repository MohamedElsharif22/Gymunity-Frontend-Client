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
        // Handle both paginated and non-paginated response formats
        if (Array.isArray(response)) {
          return response;
        }
        
        // Handle paginated response (items, data, or totalCount)
        return response?.items || response?.data || [];
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
    return this.apiService.get<ProgramResponse>(`/api/client/clientprograms/${programId}`);
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
      `/api/client/clientprograms/${weekId}/days`
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
      `/api/client/clientprograms/days/${dayId}`
    );
  }
}
