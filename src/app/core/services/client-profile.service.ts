import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ClientProfileRequest,
  ClientProfileResponse,
  ClientProfileDashboardResponse
} from '../models';

/**
 * Client Profile Service
 * Handles all HTTP operations for client profile management
 * Base endpoint: /api/client/profile
 * All endpoints require JWT Bearer authentication via authInterceptor
 */
@Injectable({
  providedIn: 'root'
})
export class ClientProfileService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/client/clientprofile';

  /**
   * Get authenticated client's dashboard
   * Includes summary stats, active programs, subscriptions, recent activity, and metrics
   *
   * GET /api/client/profile/dashboard
   * @returns Observable<ClientProfileDashboardResponse> dashboard data
   * @throws Error on 401 (unauthorized), 404 (not found), 500 (server error)
   */
  getDashboard(): Observable<ClientProfileDashboardResponse> {
    console.log('[ClientProfileService] Fetching dashboard');
    return this.api.get<ClientProfileDashboardResponse>(`${this.endpoint}/dashboard`);
  }

  /**
   * Get authenticated client's complete profile
   * Returns all profile information including personal and fitness data
   *
   * GET /api/client/profile
   * @returns Observable<ClientProfileResponse> profile data
   * @throws Error on 401 (unauthorized), 404 (profile not found)
   */
  getProfile(): Observable<ClientProfileResponse> {
    console.log('[ClientProfileService] Fetching profile');
    return this.api.get<ClientProfileResponse>(this.endpoint);
  }

  /**
   * Create new profile for authenticated client
   * Only one profile allowed per user; returns 409 Conflict if profile exists
   *
   * POST /api/client/profile
   * @param request ClientProfileRequest with profile data
   * @returns Observable<ClientProfileResponse> created profile
   * @throws Error on 400 (validation), 401 (unauthorized), 409 (already exists)
   */
  createProfile(request: ClientProfileRequest): Observable<ClientProfileResponse> {
    console.log('[ClientProfileService] Creating profile', { bodyKeys: Object.keys(request || {}) });
    return this.api.post<ClientProfileResponse>(this.endpoint, request);
  }

  /**
   * Update authenticated client's profile
   * Updates all provided fields; omitted fields retain current values
   *
   * PUT /api/client/profile
   * @param request ClientProfileRequest with updated profile data
   * @returns Observable<ClientProfileResponse> updated profile
   * @throws Error on 400 (validation), 401 (unauthorized), 404 (profile not found)
   */
  updateProfile(request: ClientProfileRequest): Observable<ClientProfileResponse> {
    console.log('[ClientProfileService] Updating profile', { bodyKeys: Object.keys(request || {}) });
    return this.api.put<ClientProfileResponse>(this.endpoint, request);
  }

  /**
   * Delete authenticated client's profile permanently
   * WARNING: This operation cannot be undone
   *
   * DELETE /api/client/profile
   * @returns Observable<void> 204 No Content on success
   * @throws Error on 401 (unauthorized), 404 (profile not found)
   */
  deleteProfile(): Observable<void> {
    console.log('[ClientProfileService] Deleting profile');
    return this.api.delete<void>(this.endpoint);
  }
}
