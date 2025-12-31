import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ChatThread, Message, CreateChatThreadRequest, SendMessageRequest } from '../../../core/models';
import { HttpParams } from '@angular/common/http';

/**
 * Chat Service
 * Handles real-time messaging with trainers
 * Follows Angular best practices with providedIn: 'root' and inject()
 */
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiService = inject(ApiService);

  // ==================== Chat Threads ====================

  /**
   * Get all chat threads for the current user
   */
  getAllThreads(): Observable<ChatThread[]> {
    return this.apiService.get<ChatThread[]>('/api/client/chat/threads');
  }

  /**
   * Create a new chat thread
   */
  createThread(request: CreateChatThreadRequest): Observable<ChatThread> {
    return this.apiService.post<ChatThread>('/api/client/chat/threads', request);
  }

  /**
   * Get a specific chat thread
   */
  getThread(threadId: number): Observable<ChatThread> {
    return this.apiService.get<ChatThread>(`/api/client/chat/threads/${threadId}`);
  }

  // ==================== Messages ====================

  /**
   * Get all messages in a thread
   */
  getThreadMessages(threadId: number): Observable<Message[]> {
    return this.apiService.get<Message[]>(`/api/client/chat/threads/${threadId}/messages`);
  }

  /**
   * Send a message in a thread
   */
  sendMessage(threadId: number, request: SendMessageRequest): Observable<Message> {
    return this.apiService.post<Message>(`/api/client/chat/threads/${threadId}/messages`, request);
  }

  /**
   * Mark a message as read
   */
  markMessageAsRead(messageId: number): Observable<any> {
    return this.apiService.put<any>(`/api/client/chat/messages/${messageId}/read`, {});
  }

  /**
   * Mark all messages in a thread as read
   */
  markThreadAsRead(threadId: number): Observable<any> {
    return this.apiService.put<any>(`/api/client/chat/threads/${threadId}/read`, {});
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId: number): Observable<any> {
    return this.apiService.delete<any>(`/api/client/chat/messages/${messageId}`);
  }
}
