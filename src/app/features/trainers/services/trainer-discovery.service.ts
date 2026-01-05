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
 * Base endpoint: /api/client/TrainerDiscovery
 * All endpoints require authentication (handled by AuthInterceptor)
 */
@Injectable({
  providedIn: 'root'
})
export class TrainerDiscoveryService {
  private readonly apiService = inject(ApiService);
  private apiUrl = '';

  constructor() {
    // Get API URL from environment
    this.apiUrl = (environment as any).apiUrl;
  }

  /**
   * Convert relative image URLs to absolute URLs
   * If URL is already absolute or null, return as-is
   */
  private resolveImageUrl(relativeUrl: string | null): string | null {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    return `${this.apiUrl}/${relativeUrl}`;
  }

/**
   * Search trainers with optional filtering and sorting
   * GET /api/client/TrainerDiscovery
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
    
    return this.apiService.get<any>('/api/client/TrainerDiscovery', { params }).pipe(
      map(response => {
        console.log('[TrainerDiscoveryService] Raw API response:', response);
        
        // Handle both old (data/count) and new (items/totalCount) response formats
        const trainers = (response?.items ?? response?.data ?? []) as TrainerCard[];
        
        // Transform trainer data: resolve image URLs and handle nulls
        const transformedTrainers = trainers.map(trainer => ({
          ...trainer,
          profilePhotoUrl: this.resolveImageUrl(trainer.profilePhotoUrl),
          coverImageUrl: this.resolveImageUrl(trainer.coverImageUrl),
          specializations: trainer.specializations || [],
          startingPrice: trainer.startingPrice ?? 0
        }));
        
        const result: TrainerDiscoveryResponse = {
          pageIndex: response?.pageIndex || 1,
          pageSize: response?.pageSize || 20,
          totalCount: response?.totalCount ?? response?.count ?? 0,
          items: transformedTrainers
        };
        
        console.log('[TrainerDiscoveryService] Mapped response:', result);
        return result;
      })
    );
  }
}
