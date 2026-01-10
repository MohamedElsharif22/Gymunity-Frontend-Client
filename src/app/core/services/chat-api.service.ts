import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from './../../../environments/environment.development';
import { ApiResponse } from '../models/common.model';
import {
  ChatThread,
  CreateChatThreadRequest,
  CreateChatThreadResponse,
  MessageResponse,
  SendMessageRequest,
  ClientTrainer
} from '../models/chat.model';

/**
 * ChatApiService
 * Handles all REST API calls for chat functionality
 * Endpoints: /api/Chat/threads, /api/Chat/messages, etc.
 */
@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private readonly apiUrl = `${environment.apiUrl}/api/Chat`;
  private readonly clientApiUrl = `${environment.apiUrl}/api/client`;

  constructor(private http: HttpClient) {}

  /**
   * Get all chat threads for the current user
   * GET /api/Chat/threads
   * Response: { success: boolean, data?: ChatThread[] }
   */
  getThreads(): Observable<ChatThread[]> {
    console.log('ChatApiService: Calling GET /api/Chat/threads', `${this.apiUrl}/threads`);
    return this.http.get<ApiResponse<ChatThread[]>>(`${this.apiUrl}/threads`)
      .pipe(
        map(response => {
          console.log('ChatApiService: Raw response from /api/Chat/threads:', response);
          console.log('ChatApiService: response.data:', response.data);
          console.log('ChatApiService: response.success:', response.success);
          const result = response.data || [];
          console.log('ChatApiService: Unwrapped response data:', result, 'Array?', Array.isArray(result));
          return result;
        })
      );
  }

  /**
   * Create a new chat thread with another user
   * POST /api/Chat/threads
   * Response: { success: boolean, data?: CreateChatThreadResponse }
   */
  createThread(request: CreateChatThreadRequest): Observable<CreateChatThreadResponse> {
    return this.http.post<ApiResponse<CreateChatThreadResponse>>(`${this.apiUrl}/threads`, request)
      .pipe(
        map(response => response.data!)
      );
  }

  /**
   * Get all messages in a specific thread
   * GET /api/Chat/threads/:threadId/messages
   * Response: { success: boolean, data?: MessageResponse[] }
   */
  getThreadMessages(threadId: number): Observable<MessageResponse[]> {
    return this.http.get<ApiResponse<MessageResponse[]>>(
      `${this.apiUrl}/threads/${threadId}/messages`
    ).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Send a message to a specific thread
   * POST /api/Chat/threads/:threadId/messages
   * Response: { success: boolean, data?: MessageResponse }
   */
  sendMessage(
    threadId: number,
    request: SendMessageRequest
  ): Observable<MessageResponse> {
    return this.http.post<ApiResponse<MessageResponse>>(
      `${this.apiUrl}/threads/${threadId}/messages`,
      request
    ).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Mark a specific message as read
   * PUT /api/Chat/messages/:messageId/read
   */
  markMessageAsRead(messageId: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/messages/${messageId}/read`,
      null
    );
  }

  /**
   * Mark an entire thread as read
   * PUT /api/Chat/threads/:threadId/read
   */
  markThreadAsRead(threadId: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/threads/${threadId}/read`,
      null
    );
  }

  /**
   * Delete a chat thread
   * DELETE /api/Chat/threads/:threadId
   */
  deleteThread(threadId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/threads/${threadId}`
    );
  }

  /**
   * Get all trainers associated with the current client
   * GET /api/client/clientTrainers
   * Response: ClientTrainer[] (direct array, not wrapped in ApiResponse)
   */
  getClientTrainers(): Observable<ClientTrainer[]> {
    const url = `${this.clientApiUrl}/clientTrainers`;
    console.log('Getting trainers from URL:', url);
    return this.http.get<ClientTrainer[]>(url)
      .pipe(
        map(response => {
          console.log('Trainers API response:', response);
          const trainers = Array.isArray(response) ? response : [];
          console.log('Extracted trainers:', trainers);
          if (trainers.length === 0) {
            console.warn('No trainers returned from API. Please check if the endpoint is correct or if client has trainers assigned.');
          }
          return trainers;
        })
      );
  }
}
