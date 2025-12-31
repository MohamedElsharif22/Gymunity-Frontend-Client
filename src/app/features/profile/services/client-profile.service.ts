import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ClientProfile,
  CreateClientProfileRequest,
  UpdateClientProfileRequest,
  DashboardResponse
} from '../../../core/models';

/**
 * Client Profile Service
 * Handles all client profile and onboarding related API calls
 * Follows Angular best practices with providedIn: 'root' and inject()
 */
@Injectable({
  providedIn: 'root'
})
export class ClientProfileService {
  private readonly apiService = inject(ApiService);

  /**
   * Get the current client's full profile
   */
  getMyProfile(): Observable<ClientProfile> {
    return this.apiService.get<ClientProfile>('/api/client/clientprofile');
  }

  /**
   * Get client dashboard data with onboarding status and recent body state
   */
  getDashboard(): Observable<DashboardResponse> {
    return this.apiService.get<DashboardResponse>('/api/client/clientprofile/dashboard');
  }

  /**
   * Create a new client profile (initial setup)
   */
  createProfile(request: CreateClientProfileRequest): Observable<ClientProfile> {
    return this.apiService.post<ClientProfile>('/api/client/clientprofile', request);
  }

  /**
   * Update existing client profile
   */
  updateProfile(request: UpdateClientProfileRequest): Observable<ClientProfile> {
    return this.apiService.put<ClientProfile>('/api/client/clientprofile', request);
  }

  /**
   * Delete client profile
   */
  deleteProfile(): Observable<any> {
    return this.apiService.delete<any>('/api/client/clientprofile');
  }

  /**
   * Check if onboarding is completed
   */
  checkOnboardingStatus(): Observable<boolean> {
    return this.apiService.get<boolean>('/api/client/onboarding/status');
  }

  /**
   * Complete the onboarding process
   */
  completeOnboarding(data: Omit<CreateClientProfileRequest, 'userName'>): Observable<ClientProfile> {
    return this.apiService.put<ClientProfile>('/api/client/onboarding/complete', data);
  }
}

