import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatThread } from '../../../../core/models/chat.model';
import { ChatApiService } from '../../../../core/services/chat-api.service';
import { ClientTrainer } from '../../../../core/models/chat.model';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatListComponent {
  private readonly chatApiService = inject(ChatApiService);

  // Signal inputs (Angular best practice for OnPush)
  threads = input<ChatThread[]>([]);
  selectedThread = input<ChatThread | null>(null);
  isConnecting = input(false);
  isLoading = input(false);
  unreadCount = input(0);

  // Outputs
  selectThread = output<ChatThread>();
  refresh = output<void>();
  startNewChat = output<string>();  // Emit trainer userId

  searchQuery = signal('');
  showTrainerDropdown = signal(false);
  trainers = signal<ClientTrainer[]>([]);
  loadingTrainers = signal(false);
  trainerSearchQuery = signal('');

  filteredThreads = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.threads().filter(
      thread => 
        (thread.otherUserName?.toLowerCase().includes(query) ?? false) || 
        thread.id.toString().includes(query)
    );
  });

  filteredTrainers = computed(() => {
    const query = this.trainerSearchQuery().toLowerCase();
    return this.trainers().filter(
      trainer =>
        trainer.fullName.toLowerCase().includes(query) ||
        trainer.userName.toLowerCase().includes(query) ||
        trainer.handle.toLowerCase().includes(query)
    );
  });

  onSelectThread(thread: ChatThread): void {
    this.selectThread.emit(thread);
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  onNewChat(): void {
    this.showTrainerDropdown.set(!this.showTrainerDropdown());
    if (this.showTrainerDropdown() && this.trainers().length === 0) {
      this.loadTrainers();
    }
  }

  private loadTrainers(): void {
    this.loadingTrainers.set(true);
    console.log('Loading trainers...');
    this.chatApiService.getClientTrainers().subscribe({
      next: (trainers) => {
        console.log('Trainers loaded:', trainers);
        console.log('Number of trainers:', trainers?.length || 0);
        this.trainers.set(trainers || []);
        this.loadingTrainers.set(false);
      },
      error: (error) => {
        console.error('Error loading trainers:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        });
        this.trainers.set([]);
        this.loadingTrainers.set(false);
      }
    });
  }

  onSelectTrainer(trainer: ClientTrainer): void {
    this.startNewChat.emit(trainer.userId);
    this.showTrainerDropdown.set(false);
    this.trainerSearchQuery.set('');
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  formatTime(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString();
  }

  truncateMessage(message: string | undefined, length: number = 50): string {
    if (!message) return '';
    return message.length > length ? message.substring(0, length) + '...' : message;
  }
}
