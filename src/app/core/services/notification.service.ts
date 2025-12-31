import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Notification, NotificationResponse } from '../models';
import { HttpParams } from '@angular/common/http';

/**
 * Notification Service
 * Handles user notifications and alerts
 * Follows Angular best practices with providedIn: 'root' and inject() + signals
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiService = inject(ApiService);

  // Signals for state management
  private readonly unreadCountSignal = signal<number>(0);
  readonly unreadCount = this.unreadCountSignal.asReadonly();

  /**
   * Get all notifications with pagination
   */
  getAllNotifications(pageNumber: number = 1, pageSize: number = 20): Observable<NotificationResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.apiService.get<NotificationResponse>('/api/client/notifications', params).pipe(
      tap(response => {
        this.unreadCountSignal.set((response as NotificationResponse).unreadCount);
      })
    );
  }

  /**
   * Get the count of unread notifications
   */
  getUnreadCount(): Observable<number> {
    return this.apiService.get<number>('/api/client/notifications/unread-count').pipe(
      tap(count => {
        this.unreadCountSignal.set((count as unknown as number) ?? 0);
      })
    );
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: number): Observable<any> {
    return this.apiService.put<any>(`/api/client/notifications/${notificationId}/read`, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<any> {
    return this.apiService.put<any>('/api/client/notifications/mark-all-read', {});
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: number): Observable<any> {
    return this.apiService.delete<any>(`/api/client/notifications/${notificationId}`);
  }

  /**
   * Get local unread count from signal
   */
  getLocalUnreadCount(): number {
    return this.unreadCountSignal();
  }
}

