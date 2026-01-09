import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterContentChecked,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message, ChatThread, MessageType } from '../../../../core/models/chat.model';
import { User } from '../../../../core/models';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowComponent implements AfterViewInit, AfterContentChecked {
  // Signal inputs
  messages = input<Message[]>([]);
  currentUser = input<User | null>(null);
  selectedThread = input<ChatThread | null>(null);
  messageChangeTrigger = input(0); // Trigger signal from parent

  // Outputs
  sendMessage = output<string>();

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  messageText = signal('');
  isSending = signal(false);
  private previousMessageCount = 0;
  private shouldScroll = false;

  constructor() {
    // Track message count changes
    effect(() => {
      const currentMessageCount = this.messages().length;
      const trigger = this.messageChangeTrigger();
      
      // If message count increased, scroll to bottom
      if (currentMessageCount > this.previousMessageCount || trigger > 0) {
        this.shouldScroll = true;
        this.previousMessageCount = currentMessageCount;
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngAfterContentChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        setTimeout(() => {
          this.messagesContainer.nativeElement.scrollTop =
            this.messagesContainer.nativeElement.scrollHeight;
        }, 0);
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  }

  onSendMessage(): void {
    const text = this.messageText().trim();
    if (text) {
      this.isSending.set(true);
      this.sendMessage.emit(text);
      this.messageText.set('');
      this.shouldScroll = true;
      // Reset sending state after brief delay
      setTimeout(() => {
        this.isSending.set(false);
      }, 300);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  formatTime(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  getMessageTypeIcon(type: string | MessageType): string {
    // Handle both string and enum types from backend
    const typeStr = typeof type === 'string' ? type.toLowerCase() : type;
    
    switch (typeStr) {
      case 'image':
      case MessageType.Image:
        return '🖼️';
      case 'video':
      case MessageType.Video:
        return '🎥';
      case 'audio':
      case MessageType.Audio:
        return '🎵';
      case 'file':
      case MessageType.File:
        return '📎';
      default:
        return '';
    }
  }

  onMessageInputChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.messageText.set(target.value);
  }
}