import { Injectable, inject, signal, computed, effect } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, throwError, catchError, map } from 'rxjs';
import { AuthService } from './auth.service';
import { ChatApiService } from './chat-api.service';
import { environment } from '../../../environments/environment';
import {
  ChatThread,
  Message,
  MessageResponse,
  SendMessageRequest,
  CreateChatThreadRequest
} from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly authService = inject(AuthService);
  private readonly chatApiService = inject(ChatApiService);
  private connection: signalR.HubConnection | null = null;
  
  // Connection state signals
  private isConnectingSignal = signal(false);
  private isConnectedSignal = signal(false);

  // Data signals - thread-scoped storage for messages
  private threadsSignal = signal<ChatThread[]>([]);
  private messagesPerThreadSignal = signal<Map<number, Set<number>>>(new Map()); // Track message IDs per thread for deduplication
  private messageDetailsSignal = signal<Map<number, Message>>(new Map()); // Store all messages by ID
  private currentThreadSignal = signal<ChatThread | null>(null);
  private isLoadingSignal = signal(false);

  // Computed signals
  readonly isConnecting = computed(() => this.isConnectingSignal());
  readonly isConnected = computed(() => this.isConnectedSignal());
  readonly threads = computed(() => this.threadsSignal());
  readonly currentThread = computed(() => this.currentThreadSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  
  // Thread-specific messages
  readonly messages = computed(() => {
    const currentThread = this.currentThreadSignal();
    if (!currentThread) {
      console.log('No current thread selected');
      return [];
    }
    
    const messageIds = this.messagesPerThreadSignal().get(currentThread.id) || new Set();
    const messageDetails = this.messageDetailsSignal();
    const result = Array.from(messageIds)
      .sort((a, b) => a - b)
      .map(id => messageDetails.get(id))
      .filter((msg): msg is Message => msg !== undefined);
    
    console.log(`Computed messages for thread ${currentThread.id}:`, result.length, 'messages');
    return result;
  });
  
  // Unread count as computed signal for reactivity
  readonly unreadCount = computed(() => {
    return this.threadsSignal().reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);
  });

  /**
   * Connect to SignalR hub for real-time messaging
   */
  async connectToChat(): Promise<void> {
    if (this.isConnectedSignal()) {
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('User must be authenticated to connect to chat');
    }

    this.isConnectingSignal.set(true);

    try {
      const hubUrl = `${environment.apiUrl}/hubs/chat`;
      const token = localStorage.getItem('authToken');

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token || '',
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 0, 1000, 3000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event listeners
      this.setupSignalRListeners();

      await this.connection.start();
      this.isConnectedSignal.set(true);
      console.log('Connected to chat hub');
    } catch (error) {
      console.error('Error connecting to chat:', error);
      throw error;
    } finally {
      this.isConnectingSignal.set(false);
    }
  }

  private setupSignalRListeners(): void {
    if (!this.connection) return;

    console.log('📡 Setting up SignalR listeners...');

    // Receive message in real-time
    this.connection.on('ReceiveMessage', (message: MessageResponse) => {
      console.log('🔔 ReceiveMessage event received:', message);
      console.log('📍 Current thread ID:', this.currentThreadSignal()?.id);
      console.log('📍 Message thread ID:', message.threadId);
      console.log('👤 Current user ID:', this.authService.currentUser()?.id);
      console.log('👤 Message sender ID:', message.senderId);
      
      const processedMessage: Message = {
        ...message,
        createdAt: new Date(message.createdAt),
        isOwn: message.senderId === this.authService.currentUser()?.id,
        isRead: message.isRead
      };

      // Deduplicate: Only add if not already present
      if (this.addMessageToThread(processedMessage.threadId, processedMessage)) {
        console.log('✅ Message added to thread via SignalR:', processedMessage);
        
        // Update thread's lastMessage and lastMessageAt
        this.updateThreadMetadata(processedMessage.threadId, processedMessage);
      } else {
        console.warn('⚠️ Message was deduplicated (already exists)');
      }
    });

    // Thread updated in real-time
    this.connection.on('ThreadUpdated', (thread: ChatThread) => {
      thread.createdAt = new Date(thread.createdAt);
      thread.lastMessageAt = new Date(thread.lastMessageAt);
      this.threadsSignal.update(threads =>
        threads.map(t => (t.id === thread.id ? thread : t))
      );
    });

    // Message marked as read
    this.connection.on('MessageRead', (messageId: number) => {
      const messageDetails = this.messageDetailsSignal();
      const message = messageDetails.get(messageId);
      if (message) {
        messageDetails.set(messageId, { ...message, isRead: true });
        this.messageDetailsSignal.set(messageDetails);
      }
    });

    // Connection reconnected
    this.connection.onreconnected(() => {
      console.log('Reconnected to chat hub');
      this.isConnectedSignal.set(true);
    });

    // Connection reconnecting
    this.connection.onreconnecting(() => {
      console.log('Reconnecting to chat hub...');
      this.isConnectedSignal.set(false);
    });

    // Connection closed
    this.connection.onclose(() => {
      console.log('Disconnected from chat hub');
      this.isConnectedSignal.set(false);
    });
  }

  /**
   * Add message to thread with deduplication
   * Returns true if message was added, false if duplicate
   */
  private addMessageToThread(threadId: number, message: Message): boolean {
    // Get current maps
    const messagesPerThread = new Map(this.messagesPerThreadSignal());
    const messageIds = messagesPerThread.get(threadId) || new Set();
    
    // Check if message already exists
    if (messageIds.has(message.id)) {
      console.warn(`Duplicate message detected: ${message.id}, skipping`);
      return false;
    }

    // Add message ID to thread's set (create new Set to trigger reactivity)
    const updatedMessageIds = new Set(messageIds);
    updatedMessageIds.add(message.id);
    messagesPerThread.set(threadId, updatedMessageIds);
    this.messagesPerThreadSignal.set(messagesPerThread);

    // Store message details (create new Map to trigger reactivity)
    const messageDetails = new Map(this.messageDetailsSignal());
    messageDetails.set(message.id, message);
    this.messageDetailsSignal.set(messageDetails);

    console.log('Message added to thread:', threadId, 'MessageId:', message.id);
    return true;
  }

  /**
   * Update thread metadata when new message arrives
   */
  private updateThreadMetadata(threadId: number, message: Message): void {
    this.threadsSignal.update(threads =>
      threads.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            unreadCount: message.isOwn ? t.unreadCount : (t.unreadCount || 0) + 1
          };
        }
        return t;
      })
    );
  }

  /**
   * Load all chat threads via REST API
   */
  loadThreads(): Observable<ChatThread[]> {
    console.log('ChatService.loadThreads: Starting...');
    this.isLoadingSignal.set(true);
    
    return this.chatApiService.getThreads().pipe(
      map(threads => {
        console.log('ChatService.loadThreads: Received threads:', threads, 'Type:', typeof threads, 'Is Array:', Array.isArray(threads));
        
        // Process threads and convert dates
        const processedThreads = Array.isArray(threads) ? threads.map(thread => ({
          ...thread,
          createdAt: new Date(thread.createdAt || new Date()),
          lastMessageAt: new Date(thread.lastMessageAt)
        })) : [];
        
        console.log('ChatService.loadThreads: Processed threads:', processedThreads);
        this.threadsSignal.set(processedThreads);
        console.log('ChatService.loadThreads: Thread signal updated. Current value:', this.threadsSignal());
        this.isLoadingSignal.set(false);
        
        return processedThreads;
      }),
      catchError(error => {
        console.error('ChatService.loadThreads: Error:', error);
        console.log('ChatService.loadThreads: Error details:', {
          status: error?.status,
          statusText: error?.statusText,
          message: error?.message,
          url: error?.url,
          error: error?.error
        });
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Load messages for a specific thread via REST API
   */
  loadThreadMessages(threadId: number): Observable<Message[]> {
    this.isLoadingSignal.set(true);
    
    return this.chatApiService.getThreadMessages(threadId).pipe(
      map(messages => {
        // Process messages and track them per thread
        const processedMessages: Message[] = Array.isArray(messages) ? messages.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
          isOwn: msg.senderId === this.authService.currentUser()?.id
        })) : [];
        
        // Clear previous messages for this thread and add new ones
        // Create NEW Map to trigger signal update
        const messagesPerThread = new Map(this.messagesPerThreadSignal());
        messagesPerThread.delete(threadId); // Clear old messages
        
        // Create NEW Map to trigger signal update
        const messageDetails = new Map(this.messageDetailsSignal());
        const threadMessageIds = new Set<number>();
        
        processedMessages.forEach(msg => {
          threadMessageIds.add(msg.id);
          messageDetails.set(msg.id, msg);
        });
        
        messagesPerThread.set(threadId, threadMessageIds);
        this.messagesPerThreadSignal.set(messagesPerThread);
        this.messageDetailsSignal.set(messageDetails);
        
        console.log('Messages loaded for thread', threadId, ':', processedMessages);
        console.log('Current messages signal:', this.messages());
        
        this.isLoadingSignal.set(false);
        return processedMessages;
      }),
      catchError(error => {
        console.error('Error loading messages:', error);
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new chat thread via REST API
   */
  createThread(otherUserId: string): Observable<ChatThread> {
    return this.chatApiService.createThread({ otherUserId }).pipe(
      map(response => {
        const thread: ChatThread = {
          ...response,
          createdAt: new Date(response.createdAt),
          lastMessageAt: new Date(response.lastMessageAt)
        };
        // Add to threads list
        this.threadsSignal.update(threads => [thread, ...threads]);
        return thread;
      }),
      catchError(error => {
        console.error('Error creating thread:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Send a message to a thread via REST API
   */
  sendMessage(threadId: number, request: SendMessageRequest): Observable<MessageResponse> {
    return this.chatApiService.sendMessage(threadId, request).pipe(
      map(message => {
        const messageWithOwner: Message = {
          ...message,
          createdAt: new Date(message.createdAt),
          isOwn: true
        };
        // Add to message storage
        this.addMessageToThread(threadId, messageWithOwner);
        return message;
      }),
      catchError(error => {
        console.error('Error sending message:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mark a message as read via REST API
   */
  markMessageAsRead(messageId: number): Observable<void> {
    return this.chatApiService.markMessageAsRead(messageId).pipe(
      map(() => {
        const messageDetails = new Map(this.messageDetailsSignal());
        const message = messageDetails.get(messageId);
        if (message) {
          messageDetails.set(messageId, { ...message, isRead: true });
          this.messageDetailsSignal.set(messageDetails);
        }
      }),
      catchError(error => {
        console.error('Error marking message as read:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mark entire thread as read via REST API
   */
  markThreadAsRead(threadId: number): Observable<void> {
    return this.chatApiService.markThreadAsRead(threadId).pipe(
      map(() => {
        this.threadsSignal.update(threads =>
          threads.map(t => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
        );
      }),
      catchError(error => {
        console.error('Error marking thread as read:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Set current thread and load its messages
   */
  setCurrentThread(thread: ChatThread | null): void {
    this.currentThreadSignal.set(thread);
    if (thread) {
      this.loadThreadMessages(thread.id)
        .pipe(
          catchError(error => {
            console.error('Error loading thread messages:', error);
            return throwError(() => error);
          })
        )
        .subscribe();
      this.markThreadAsRead(thread.id)
        .pipe(
          catchError(error => {
            console.error('Error marking thread as read:', error);
            return throwError(() => error);
          })
        )
        .subscribe();
    }
  }

  /**
   * Disconnect from SignalR hub
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.isConnectedSignal.set(false);
        console.log('Disconnected from chat hub');
      } catch (error) {
        console.error('Error disconnecting from chat:', error);
      }
    }
  }

  /**
   * Clear all messages for a thread
   */
  clearThreadMessages(threadId: number): void {
    const messagesPerThread = new Map(this.messagesPerThreadSignal());
    const messageIds = messagesPerThread.get(threadId);
    
    if (messageIds) {
      // Remove message details
      const messageDetails = new Map(this.messageDetailsSignal());
      messageIds.forEach(id => messageDetails.delete(id));
      this.messageDetailsSignal.set(messageDetails);
      
      // Remove thread from mapping
      messagesPerThread.delete(threadId);
      this.messagesPerThreadSignal.set(messagesPerThread);
    }
  }

  /**
   * Get total unread count - now a computed signal for reactivity
   */
  getUnreadCount(): number {
    return this.unreadCount();
  }

  /**
   * Periodically poll for new messages (fallback if SignalR fails)
   */
  startMessagePolling(intervalMs: number = 5000): void {
    setInterval(() => {
      const currentThread = this.currentThreadSignal();
      if (currentThread) {
        console.log('⏰ Polling for new messages in thread:', currentThread.id);
        this.loadThreadMessages(currentThread.id)
          .subscribe({
            next: (messages) => {
              console.log('✅ Polling retrieved', messages.length, 'messages');
            },
            error: (error) => {
              console.error('⚠️ Polling error:', error);
            }
          });
      }
    }, intervalMs);
  }
}

