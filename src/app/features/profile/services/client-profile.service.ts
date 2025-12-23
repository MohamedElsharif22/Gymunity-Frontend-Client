import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ClientProfile, CreateClientProfileRequest, UpdateClientProfileRequest, OnboardingStatus } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ClientProfileService {
  private apiService = inject(ApiService);

  getMyProfile(): Observable<ClientProfile> {
    return this.apiService.get<ClientProfile>('/api/client/clientprofile');
  }

  createProfile(request: CreateClientProfileRequest): Observable<ClientProfile> {
    return this.apiService.post<ClientProfile>('/api/client/ClientProfile', request);
  }

  updateProfile(request: UpdateClientProfileRequest): Observable<ClientProfile> {
    return this.apiService.put<ClientProfile>('/api/client/clientprofile/profile', request);
  }

  deleteProfile(): Observable<any> {
    return this.apiService.delete<any>('/api/client/clientprofile');
  }

  checkOnboardingStatus(): Observable<OnboardingStatus> {
    return this.apiService.get<OnboardingStatus>('/api/client/Onboarding/onboarding/status');
  }

  completeOnboarding(data: any): Observable<any> {
    return this.apiService.put<any>('/api/client/Onboarding/onboarding/complete', data);
  }
}
