import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Subscription, SubscribeRequest, Package, SubscribePackageRequest, ActivateSubscriptionRequest, SubscriptionResponse } from '../../../core/models';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

/**
 * Subscription Service
 * Handles trainer package subscriptions and memberships
 * Follows Angular best practices with providedIn: 'root' and inject()
 * Reference: Client-Subscriptions.md
 */
@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly apiService = inject(ApiService);

  // ==================== Packages ====================

  /**
   * Get all available packages for discovery
   */
  getAllPackages(): Observable<Package[]> {
    return this.apiService.get<Package[]>('/api/homeclient/packages');
  }

  /**
   * Get package by ID
   */
  getPackageById(packageId: number): Observable<Package> {
    return this.apiService.get<Package>(`/api/homeclient/packages/${packageId}`);
  }

  /**
   * Get packages by trainer ID
   */
  getPackagesByTrainer(trainerId: string): Observable<Package[]> {
    return this.apiService.get<Package[]>(`/api/homeclient/packages/by-trainer/${trainerId}`);
  }

  // ==================== Subscriptions (API Endpoints) ====================

  /**
   * Subscribe to a package
   * Creates a subscription in UNPAID state
   * POST /api/client/subscriptions/subscribe
   */
  subscribe(request: SubscribePackageRequest): Observable<SubscriptionResponse> {
    return this.apiService.post<SubscriptionResponse>('/api/client/subscriptions/subscribe', request);
  }

  /**
   * Get all client subscriptions
   * GET /api/client/subscriptions
   * Response format: { success: boolean, data: { totalSubscriptions, activeSubscriptions, subscriptions: [] } }
   * @param status Optional filter by SubscriptionStatus ('Active', 'Unpaid', 'Canceled', 'Expired')
   */
  getClientSubscriptions(status?: string): Observable<SubscriptionResponse[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.apiService.get<{ success: boolean; data: { subscriptions: SubscriptionResponse[] } }>(
      '/api/client/subscriptions',
      params
    ).pipe(
      map(response => response?.data?.subscriptions || [])
    );
  }

  /**
   * Get single subscription details
   * GET /api/client/subscriptions/{id}
   */
  getSubscriptionById(subscriptionId: number): Observable<SubscriptionResponse> {
    return this.apiService.get<SubscriptionResponse>(`/api/client/subscriptions/${subscriptionId}`);
  }

  /**
   * Cancel a subscription
   * DELETE /api/client/subscriptions/{id}
   */
  cancelSubscription(subscriptionId: number): Observable<any> {
    return this.apiService.delete<any>(`/api/client/subscriptions/${subscriptionId}`);
  }

  /**
   * Activate a subscription after payment
   * POST /api/client/subscriptions/{id}/activate
   * Called after successful payment or webhook
   */
  activateSubscription(subscriptionId: number, request: ActivateSubscriptionRequest): Observable<SubscriptionResponse> {
    return this.apiService.post<SubscriptionResponse>(
      `/api/client/subscriptions/${subscriptionId}/activate`,
      request
    );
  }

  // ==================== Legacy Methods (For backwards compatibility) ====================

  /**
   * @deprecated Use getClientSubscriptions() instead
   */
  getMySubscriptions(): Observable<SubscriptionResponse[]> {
    return this.getClientSubscriptions();
  }

  /**
   * @deprecated Use getSubscriptionById() instead
   */
  getSubscription(subscriptionId: number): Observable<SubscriptionResponse> {
    return this.getSubscriptionById(subscriptionId);
  }

  /**
   * @deprecated Use subscribe() with SubscribePackageRequest instead
   */
  subscribeLegacy(request: SubscribeRequest): Observable<SubscriptionResponse> {
    return this.subscribe(request as SubscribePackageRequest);
  }

  /**
   * Check if user has access to a trainer
   */
  hasAccessToTrainer(trainerUserId: string): Observable<boolean> {
    return this.apiService.get<boolean>(`/api/client/subscriptions/access/trainer/${trainerUserId}`);
  }

  /**
   * Reactivate a cancelled subscription
   */
  reactivateSubscription(subscriptionId: number): Observable<any> {
    return this.apiService.post<any>(`/api/client/subscriptions/${subscriptionId}/reactivate`, {});
  }
}

