import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { TrainerCard, TrainerSearchOptions, TrainerDiscoveryResponse } from '../../../core/models';
import { environment } from '../../../../environments/environment';

/**
 * Trainer Discovery Service
 * Handles API calls to search and discover trainers
 * Follows Angular best practices with providedIn: 'root' and inject()
 *
 * Base endpoint: /api/client/homeclient/trainers
 * All endpoints require authentication (handled by AuthInterceptor)
 */
@Injectable({
  providedIn: 'root'
})
export class TrainerDiscoveryService {
  private readonly apiService = inject(ApiService);

  /**
   * Get all trainers
   * GET /api/client/homeclient/trainers
   *
   * @returns Observable<TrainerCard[]> - List of trainer cards
   * @throws 401 Unauthorized if user not authenticated (handled by AuthInterceptor)
   * @throws 400 Bad Request on server error
   */
  getAllTrainers(): Observable<TrainerCard[]> {
    console.log('[TrainerDiscoveryService] Fetching all trainers');
    
    return this.apiService.get<TrainerCard[]>('/api/homeclient/trainers').pipe(
      map(trainers => {
        console.log('[TrainerDiscoveryService] Fetched trainers:', trainers);
        return trainers || [];
      })
    );
  }

  /**
   * Search trainers with optional filtering and sorting
   * GET /api/client/homeclient/trainers
   *
   * Query parameters supported by API:
   * - search: free text search (trainer name/handle/bio)
   * - specialization: filter by specialization (exact or comma-separated)
   * - minExperience: minimum years of experience (number)
   * - maxPrice: maximum starting price (number)
   * - isVerified: only verified trainers (boolean)
   * - sortBy: 'rating'|'experience'|'price'|'clients' (default: 'rating')
   * - page: page number (default 1)
   * - pageSize: items per page (default 20)
   *
   * Returns: Pagination<TrainerCard> with pageIndex, pageSize, totalCount, items
   *
   * @param options - Search/filter options to apply
   * @returns Observable<TrainerDiscoveryResponse> - Paginated list of trainer cards
   * @throws 401 Unauthorized if user not authenticated (handled by AuthInterceptor)
   * @throws 400 Bad Request on server error
   */
  searchTrainers(options?: TrainerSearchOptions): Observable<TrainerDiscoveryResponse> {
    console.log('[TrainerDiscoveryService] Searching trainers with options:', options);
    
    // Build query parameters from options
    let params = new HttpParams();
    if (options) {
      if (options.search) params = params.set('search', options.search);
      if (options.specialization) params = params.set('specialization', options.specialization);
      if (options.minExperience) params = params.set('minExperience', options.minExperience.toString());
      if (options.maxPrice) params = params.set('maxPrice', options.maxPrice.toString());
      if (options.isVerified !== undefined) params = params.set('isVerified', options.isVerified.toString());
      if (options.sortBy) params = params.set('sortBy', options.sortBy);
      if (options.page) params = params.set('page', options.page.toString());
      if (options.pageSize) params = params.set('pageSize', options.pageSize.toString());
    }
    
    return this.apiService.get<any>('/api/homeclient/trainers', { params }).pipe(
      map(response => {
        console.log('[TrainerDiscoveryService] Raw API response:', response);
        
        // Handle both array and paginated response formats
        let trainers: TrainerCard[] = [];
        let totalCount = 0;
        
        if (Array.isArray(response)) {
          trainers = response;
          totalCount = trainers.length;
        } else {
          trainers = (response?.items ?? response?.data ?? []) as TrainerCard[];
          totalCount = response?.totalCount ?? response?.count ?? trainers.length;
        }
        
        const result: TrainerDiscoveryResponse = {
          pageIndex: response?.pageIndex || 1,
          pageSize: response?.pageSize || trainers.length || 20,
          totalCount: totalCount,
          items: trainers
        };
        
        console.log('[TrainerDiscoveryService] Mapped response:', result);
        return result;
      })
    );
  }

  /**
   * Get trainer by ID
   * GET /api/client/homeclient/trainers/{id}
   *
   * @param id - Trainer ID
   * @returns Observable<TrainerCard> - Single trainer card
   * @throws 401 Unauthorized if user not authenticated
   * @throws 404 Not Found if trainer doesn't exist
   */
  getTrainerById(id: number): Observable<TrainerCard> {
    console.log('[TrainerDiscoveryService] Fetching trainer with ID:', id);
    
    return this.apiService.get<TrainerCard>(`/api/homeclient/trainers/${id}`).pipe(
      map(trainer => {
        console.log('[TrainerDiscoveryService] Fetched trainer:', trainer);
        return trainer;
      })
    );
  }
}
