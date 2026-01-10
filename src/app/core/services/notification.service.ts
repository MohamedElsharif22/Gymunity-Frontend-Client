import { Injectable, inject, signal, effect } from '@angular/core';
import { Observable, tap, interval } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Notification, NotificationResponse } from '../models';
import { HttpParams } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

/**
 * Notification Service
 * Handles user notifications and alerts with real-time updates
 * Uses SignalR for real-time notifications + polling fallback
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  // Signals for state management
  private readonly unreadCountSignal = signal<number>(0);
  readonly unreadCount = this.unreadCountSignal.asReadonly();

  // Connection state
  private connection: signalR.HubConnection | null = null;
  private isConnected = signal(false);
  private pollInterval: any = null;

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

  /**
   * Manually increment unread count
   * Called when a new message arrives from chat service
   */
  incrementUnreadCount(): void {
    this.unreadCountSignal.update(count => count + 1);
    console.log('📢 Unread count incremented to:', this.unreadCountSignal());
  }

  /**
   * Manually decrement unread count
   */
  decrementUnreadCount(): void {
    this.unreadCountSignal.update(count => Math.max(0, count - 1));
    console.log('📢 Unread count decremented to:', this.unreadCountSignal());
  }

  /**
   * Initialize real-time notification connection
   * Connects to SignalR hub for live notifications
   */
  async connectToNotifications(): Promise<void> {
    if (this.connection) {
      console.log('ℹ️ Already connected to notifications');
      return; // Already connected
    }

    const user = this.authService.currentUser();
    if (!user) {
      console.warn('⚠️ Cannot connect to notifications: user not authenticated');
      // Still start polling as fallback
      this.startNotificationPolling();
      return;
    }

    try {
      const hubUrl = `${environment.apiUrl}/hubs/notifications`;
      const token = localStorage.getItem('authToken');

      console.log('🔗 Attempting to connect to:', hubUrl);

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token || '',
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 0, 1000, 3000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Setup event listeners BEFORE connecting
      this.setupSignalRListeners();

      // Connect
      await this.connection.start();
      this.isConnected.set(true);
      console.log('✅ Connected to notification hub successfully');

      // Load initial unread count
      this.getUnreadCount().subscribe({
        next: (count) => {
          console.log('📊 Initial unread count loaded:', count);
        },
        error: (error) => {
          console.error('❌ Failed to load initial unread count:', error);
        }
      });

    } catch (error) {
      console.error('❌ Error connecting to notifications:', error);
      // Start polling as fallback
      console.log('📡 Starting polling fallback...');
      this.startNotificationPolling();
    }
  }

  /**
   * Setup SignalR event listeners for real-time notifications
   */
  private setupSignalRListeners(): void {
    if (!this.connection) return;

    console.log('📡 Setting up notification SignalR listeners...');

    // Listen for new notifications
    this.connection.on('NewNotification', (notification: Notification) => {
      console.log('🔔 NewNotification event received:', notification);
      // Update unread count
      this.unreadCountSignal.update(count => count + 1);
    });

    // Listen for new message notification (from chat service)
    this.connection.on('NewMessage', (data: any) => {
      console.log('💬 NewMessage event received:', data);
      // Increment unread count for new message
      this.unreadCountSignal.update(count => count + 1);
    });

    // Listen for notification read event
    this.connection.on('NotificationRead', (notificationId: number) => {
      console.log('✓ NotificationRead event received for:', notificationId);
      // Decrease unread count
      this.unreadCountSignal.update(count => Math.max(0, count - 1));
    });

    // Listen for all notifications marked as read
    this.connection.on('AllNotificationsRead', () => {
      console.log('✓ AllNotificationsRead event received');
      this.unreadCountSignal.set(0);
    });

    // Reconnected
    this.connection.onreconnected(() => {
      console.log('🔄 Reconnected to notification hub');
      this.isConnected.set(true);
      // Refresh unread count
      this.getUnreadCount().subscribe({
        next: (count) => {
          console.log('📊 Unread count refreshed after reconnect:', count);
        }
      });
    });

    // Reconnecting
    this.connection.onreconnecting(() => {
      console.log('🔄 Reconnecting to notification hub...');
      this.isConnected.set(false);
    });

    // Closed
    this.connection.onclose(() => {
      console.log('❌ Disconnected from notification hub');
      this.isConnected.set(false);
    });
  }

  /**
   * Start polling for notifications as fallback
   * Useful if SignalR connection fails
   */
  private startNotificationPolling(intervalMs: number = 10000): void {
    if (this.pollInterval) {
      return; // Already polling
    }

    console.log('⏰ Starting notification polling (every', intervalMs, 'ms)');
    this.pollInterval = setInterval(() => {
      this.getUnreadCount().subscribe({
        next: (count) => {
          console.log('📊 Polling: Unread count =', count);
        },
        error: (error) => {
          console.warn('⚠️ Polling error:', error);
        }
      });
    }, intervalMs);
  }

  /**
   * Stop polling and disconnect
   */
  disconnect(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      console.log('⏹️ Stopped notification polling');
    }

    if (this.connection) {
      this.connection.stop()
        .then(() => {
          console.log('Disconnected from notification hub');
          this.isConnected.set(false);
        })
        .catch(error => console.error('Error disconnecting:', error));
    }
  }
}

