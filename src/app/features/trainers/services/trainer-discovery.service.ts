import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TrainerCard, TrainerSearchOptions, TrainerDiscoveryResponse } from '../../../core/models';

/**
 * Trainer Discovery Service
 * Handles API calls to search and discover trainers
 * Follows Angular best practices with providedIn: 'root' and inject()
 *
 * Base endpoint: /api/client/TrainerDiscovery
 * All endpoints require authentication (handled by AuthInterceptor)
 */
@Injectable({
  providedIn: 'root'
})
export class TrainerDiscoveryService {
  private readonly apiService = inject(ApiService);

  /**
   * Search trainers
   * GET /api/client/TrainerDiscovery
   *
   * Backend currently returns:
   * - First page (pageIndex = 1)
   * - 10 items per page (pageSize = 10)
   * - Total count of all trainers
   *
   * Note: Query parameters are prepared for future backend enhancement
   * to support filtering, searching, and pagination
   *
   * @param options - Search options (prepared for future use)
   * @returns Observable<TrainerDiscoveryResponse> - Paginated list of trainer cards
   * @throws 401 Unauthorized if user not authenticated
   * @throws 400 Bad Request on server error
   */
  searchTrainers(options?: TrainerSearchOptions): Observable<TrainerDiscoveryResponse> {
    console.log('[TrainerDiscoveryService] Fetching trainers from /api/client/TrainerDiscovery');
    
    // Currently the backend doesn't accept query parameters
    // This will be enhanced when backend is updated to support filtering
    return this.apiService.get<TrainerDiscoveryResponse>('/api/client/TrainerDiscovery');
  }

  /**
   * Get trainer details by ID (future enhancement)
   * GET /api/client/TrainerDiscovery/{trainerId}
   *
   * @param trainerId - The ID of the trainer to retrieve
   * @returns Observable<TrainerCard> - Trainer card details
   */
  getTrainerById(trainerId: string): Observable<TrainerCard> {
    return this.apiService.get<TrainerCard>(`/api/client/TrainerDiscovery/${trainerId}`);
  }
}
