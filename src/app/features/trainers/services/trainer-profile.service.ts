import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TrainerCard, TrainerProfileDetailResponse } from '../../../core/models';

/**
 * Trainer Profile Service
 * Handles API calls to retrieve detailed trainer profile information
 * 
 * Per backend TrainerDiscoveryController.GetTrainerProfile():
 * Endpoint: GET /api/client/TrainerDiscovery/{trainerId}
 * Response: TrainerProfileDetailResponse wrapper containing trainer data
 * 
 * Base endpoint: /api/client/TrainerDiscovery/{trainerId}
 * All endpoints require authentication (handled by AuthInterceptor)
 *
 * Follows Angular best practices with providedIn: 'root' and inject()
 */
@Injectable({
  providedIn: 'root'
})
export class TrainerProfileService {
  private readonly apiService = inject(ApiService);

  /**
   * Get trainer profile by ID
   * GET /api/client/TrainerDiscovery/{trainerId}
   *
   * Backend endpoint returns TrainerProfileDetailResponse:
   * { data: TrainerCard, message?: string, statusCode?: number }
   *
   * This method unwraps the response and returns the TrainerCard directly
   *
   * @param trainerId - The user ID (string or number) of the trainer
   * @returns Observable<TrainerCard> - Full trainer profile (unwrapped from response envelope)
   * @throws 404 Not Found if trainer profile doesn't exist
   * @throws 401 Unauthorized if not authenticated
   *
   * @example
   * getTrainerProfile('trainer-123').subscribe(profile => {
   *   console.log(profile.fullName, profile.specializations);
   * })
   */
  getTrainerProfile(trainerId: number | string): Observable<TrainerCard> {
    const id = typeof trainerId === 'number' ? trainerId.toString() : trainerId;
    console.log('[TrainerProfileService] Fetching trainer profile for trainerId:', id);
    return this.apiService.get<TrainerProfileDetailResponse>(`/api/client/TrainerDiscovery/${id}`).pipe(
      map(response => {
        if (response?.data) {
          console.log('[TrainerProfileService] Profile loaded for:', response.data.fullName);
          return response.data;
        }
        throw new Error('Trainer profile data not found in response');
      })
    );
  }

  /**
   * Get trainer profile by User ID (alternative)
   * GET /api/client/TrainerDiscovery/{userId}
   *
   * @param userId - The user ID (string) of the trainer
   * @returns Observable<TrainerCard> - Full trainer profile details
   * @throws 404 Not Found if trainer profile doesn't exist
   */
  getTrainerProfileByUserId(userId: string): Observable<TrainerCard> {
    console.log('[TrainerProfileService] Fetching trainer profile by userId:', userId);
    return this.apiService.get<TrainerProfileDetailResponse>(`/api/client/TrainerDiscovery/${userId}`).pipe(
      map(response => {
        if (response?.data) {
          return response.data;
        }
        throw new Error('Trainer profile data not found in response');
      })
    );
  }

  /**
   * Get current authenticated trainer's profile
   * GET /api/trainer/TrainerProfile
   *
   * Note: This endpoint requires the user to be authenticated as a trainer
   *
   * @returns Observable<TrainerCard> - Current trainer's profile details
   * @throws 401 Unauthorized if not authenticated
   * @throws 404 Not Found if no trainer profile exists for current user
   */
  getMyProfile(): Observable<TrainerCard> {
    console.log('[TrainerProfileService] Fetching current trainer profile');
    return this.apiService.get<TrainerCard>('/api/trainer/TrainerProfile');
  }

  /**
   * Get trainer subscribers
   * GET /api/trainer/TrainerProfile/subscribers
   *
   * Note: Requires authentication as the trainer
   *
   * @returns Observable<any[]> - List of trainer subscribers
   */
  getSubscribers(): Observable<any[]> {
    console.log('[TrainerProfileService] Fetching trainer subscribers');
    return this.apiService.get<any[]>('/api/trainer/TrainerProfile/subscribers');
  }
}
