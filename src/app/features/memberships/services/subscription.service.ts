import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Subscription, SubscribeRequest, Package } from '../../../core/models';
import { HttpParams } from '@angular/common/http';

/**
 * Subscription Service
 * Handles trainer package subscriptions and memberships
 * Follows Angular best practices with providedIn: 'root' and inject()
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

  // ==================== Subscriptions ====================

  /**
   * Subscribe to a package
   */
  subscribe(request: SubscribeRequest): Observable<Subscription> {
    return this.apiService.post<Subscription>('/api/client/subscriptions/subscribe', request);
  }

  /**
   * Get all current subscriptions
   */
  getMySubscriptions(): Observable<Subscription[]> {
    return this.apiService.get<Subscription[]>('/api/client/subscriptions');
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: number): Observable<Subscription> {
    return this.apiService.get<Subscription>(`/api/client/subscriptions/${subscriptionId}`);
  }

  /**
   * Cancel an active subscription
   */
  cancelSubscription(subscriptionId: number): Observable<any> {
    return this.apiService.post<any>(`/api/client/subscriptions/${subscriptionId}/cancel`, {});
  }

  /**
   * Reactivate a cancelled subscription
   */
  reactivateSubscription(subscriptionId: number): Observable<any> {
    return this.apiService.post<any>(`/api/client/subscriptions/${subscriptionId}/reactivate`, {});
  }

  /**
   * Check if user has access to a trainer
   */
  hasAccessToTrainer(trainerUserId: string): Observable<boolean> {
    return this.apiService.get<boolean>(`/api/client/subscriptions/access/trainer/${trainerUserId}`);
  }
}

