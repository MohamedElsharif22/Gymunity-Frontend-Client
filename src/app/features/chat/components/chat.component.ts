import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, computed, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatThread } from '../../../core/models/chat.model';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatListComponent, ChatWindowComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, OnDestroy {
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // Track mobile/desktop view state (for showing chat window on mobile)
  readonly showChatWindow = signal(false);
  
  // Signal to track when messages changed (for scroll trigger)
  private messagesChangedSignal = signal(0);

  // Expose signals to template
  readonly isConnected = this.chatService.isConnected;
  readonly isConnecting = this.chatService.isConnecting;
  readonly isLoading = this.chatService.isLoading;
  readonly threads = this.chatService.threads;
  readonly currentThread = this.chatService.currentThread;
  readonly messages = this.chatService.messages;
  readonly currentUser = this.authService.currentUser;
  readonly unreadCount = this.chatService.unreadCount;

  constructor() {
    // Effect to track message changes and emit scroll trigger
    effect(() => {
      const msgs = this.messages();
      // Update the trigger signal to notify child component
      this.messagesChangedSignal.update(count => count + 1);
    });
  }

  ngOnInit(): void {
    this.initializeChat();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chatService.disconnect();
  }

  private async initializeChat(): Promise<void> {
    try {
      // Connect to chat hub for real-time updates
      await this.chatService.connectToChat();
      // Load all chat threads via REST API
      this.chatService.loadThreads()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (threads) => {
            console.log('Chat threads loaded:', threads);
          },
          error: (error) => {
            console.error('Failed to load chat threads:', error);
          }
        });
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  }

  onSelectThread(thread: ChatThread): void {
    this.chatService.setCurrentThread(thread);
    // Show chat window on mobile when thread is selected
    this.showChatWindow.set(true);
  }

  onBackToList(): void {
    // Hide chat window on mobile to go back to list
    this.showChatWindow.set(false);
  }

  onStartNewChat(trainerId: string): void {
    this.chatService.createThread(trainerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (thread) => {
          this.chatService.setCurrentThread(thread);
          // Show chat window on mobile when new thread is created
          this.showChatWindow.set(true);
        },
        error: (error) => {
          console.error('Failed to create thread:', error);
        }
      });
  }

  async onSendMessage(content: string): Promise<void> {
    const thread = this.currentThread();
    if (thread && content.trim()) {
      try {
        this.chatService.sendMessage(thread.id, { content, type: 1 })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            error: (error) => {
              console.error('Failed to send message:', error);
            }
          });
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  }

  async onRefresh(): Promise<void> {
    try {
      this.chatService.loadThreads()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (threads) => {
            console.log('Threads refreshed:', threads);
          },
          error: (error) => {
            console.error('Failed to refresh threads:', error);
          }
        });
    } catch (error) {
      console.error('Error refreshing threads:', error);
    }
  }

  isDesktop(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  }

  /**
   * Get messages change trigger for scroll effect
   */
  getMessagesChangeTrigger(): number {
    return this.messagesChangedSignal();
  }
}
