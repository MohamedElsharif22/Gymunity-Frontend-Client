import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TrainerProfileDetail } from '../../../core/models';

/**
 * Trainer Profile Service
 * Handles API calls to retrieve detailed trainer profile information
 * Uses the trainer area endpoint: /api/trainer/TrainerProfile
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
   * GET /api/trainer/TrainerProfile/Id/{id}
   *
   * @param trainerId - The numeric ID of the trainer profile to retrieve
   * @returns Observable<TrainerProfileDetail> - Full trainer profile details
   * @throws 404 Not Found if trainer profile doesn't exist
   * @throws 400 Bad Request on server error
   *
   * @example
   * // Get trainer profile by ID
   * getTrainerProfile(42).subscribe(profile => {
   *   console.log(profile.handle, profile.bio);
   * })
   */
  getTrainerProfile(trainerId: number | string): Observable<TrainerProfileDetail> {
    const id = typeof trainerId === 'number' ? trainerId.toString() : trainerId;
    console.log('[TrainerProfileService] Fetching trainer profile:', id);
    return this.apiService.get<TrainerProfileDetail>(`/api/homeclient/trainers/${id}`);
  }

  /**
   * Get trainer profile by User ID (alternative)
   * GET /api/trainer/TrainerProfile/UserId/{userId}
   *
   * @param userId - The user ID (string) of the trainer
   * @returns Observable<TrainerProfileDetail> - Full trainer profile details
   * @throws 404 Not Found if trainer profile doesn't exist
   */
  getTrainerProfileByUserId(userId: string): Observable<TrainerProfileDetail> {
    console.log('[TrainerProfileService] Fetching trainer profile by userId:', userId);
    return this.apiService.get<TrainerProfileDetail>(`/api/homeclient/trainers/${userId}`);
  }

  /**
   * Get current authenticated trainer's profile
   * GET /api/trainer/TrainerProfile
   *
   * Note: This endpoint requires the user to be authenticated as a trainer
   *
   * @returns Observable<TrainerProfileDetail> - Current trainer's profile details
   * @throws 401 Unauthorized if not authenticated
   * @throws 404 Not Found if no trainer profile exists for current user
   */
  getMyProfile(): Observable<TrainerProfileDetail> {
    console.log('[TrainerProfileService] Fetching current trainer profile');
    return this.apiService.get<TrainerProfileDetail>('/api/trainer/TrainerProfile');
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
