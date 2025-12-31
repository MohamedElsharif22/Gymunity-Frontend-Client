/**
 * Notification models
 * Aligns with Gymunity Backend API specification
 */

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: number;
  relatedEntityType?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
}

export interface NotificationResponse {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
}

export enum NotificationType {
  Message = 1,
  Subscription = 2,
  Payment = 3,
  Booking = 4,
  System = 5,
  Review = 6,
  Program = 7
}
