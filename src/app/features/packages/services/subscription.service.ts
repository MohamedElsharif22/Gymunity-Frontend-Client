import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { HttpParams } from '@angular/common/http';

export interface SubscribePackageRequest {
  packageId: number;
  isAnnual?: boolean;
  promoCode?: string;
}

export interface SubscriptionResponse {
  id: number;
  packageId: number;
  packageName: string;
  packageDescription: string;
  trainerId: string;
  trainerName: string;
  trainerHandle: string;
  trainerPhotoUrl?: string;
  status: string; // 'Unpaid' | 'Active' | 'Canceled' | 'Expired'
  amountPaid: number;
  currency: string;
  isAnnual: boolean;
  startDate: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  daysRemaining: number;
  isExpiringSoon: boolean;
  hasExpired: boolean;
  featuresIncluded: string[];
}

export interface SubscriptionListResponse {
  totalSubscriptions: number;
  activeSubscriptions: number;
  subscriptions: SubscriptionResponse[];
}

export interface ActivateSubscriptionRequest {
  transactionId: string;
}

/**
 * Subscription Service
 * Handles all subscription-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly apiService = inject(ApiService);

  /**
   * Subscribe to a package
   */
  subscribe(request: SubscribePackageRequest): Observable<{ success: boolean; message: string; data: SubscriptionResponse }> {
    return this.apiService.post<{ success: boolean; message: string; data: SubscriptionResponse }>(
      '/api/client/subscriptions/subscribe',
      request
    );
  }

  /**
   * Get all client subscriptions
   */
  getMySubscriptions(status?: string): Observable<{ success: boolean; data: SubscriptionListResponse }> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.apiService.get<{ success: boolean; data: SubscriptionListResponse }>(
      '/api/client/subscriptions',
      params
    );
  }

  /**
   * Get single subscription details
   */
  getSubscriptionById(subscriptionId: number): Observable<{ success: boolean; data: SubscriptionResponse }> {
    return this.apiService.get<{ success: boolean; data: SubscriptionResponse }>(
      `/api/client/subscriptions/${subscriptionId}`
    );
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(subscriptionId: number): Observable<{ success: boolean; message: string }> {
    return this.apiService.delete<{ success: boolean; message: string }>(
      `/api/client/subscriptions/${subscriptionId}`
    );
  }

  /**
   * Activate subscription after payment
   */
  // activateSubscription(subscriptionId: number, request: ActivateSubscriptionRequest): Observable<{ success: boolean; message: string; data: SubscriptionResponse }> {
  //   return this.apiService.post<{ success: boolean; message: string; data: SubscriptionResponse }>(
  //     `/api/client/subscriptions/${subscriptionId}/activate`,
  //     request
  //   );
  // }
}
