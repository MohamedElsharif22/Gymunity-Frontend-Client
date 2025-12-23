import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Subscription, SubscribeRequest, SubscriptionStatus } from '../../../core/models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiService = inject(ApiService);

  getMySubscriptions(status?: SubscriptionStatus): Observable<Subscription[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.apiService.get<Subscription[]>('/api/client/subscriptions', params);
  }

  getSubscription(subscriptionId: number): Observable<Subscription> {
    return this.apiService.get<Subscription>(`/api/client/subscriptions/${subscriptionId}`);
  }

  subscribe(request: SubscribeRequest): Observable<Subscription> {
    return this.apiService.post<Subscription>('/api/client/subscriptions/subscribe', request);
  }

  cancelSubscription(subscriptionId: number): Observable<any> {
    return this.apiService.post<any>(`/api/client/subscriptions/${subscriptionId}/cancel`, {});
  }

  reactivateSubscription(subscriptionId: number): Observable<any> {
    return this.apiService.post<any>(`/api/client/subscriptions/${subscriptionId}/reactivate`, {});
  }

  hasAccessToTrainer(trainerUserId: string): Observable<boolean> {
    return this.apiService.get<boolean>(`/api/client/subscriptions/access/trainer/${trainerUserId}`);
  }
}
