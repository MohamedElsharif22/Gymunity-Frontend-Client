import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientLogsService } from '../../../../core/services/client-logs.service';
import { BodyStateLogResponse } from '../../../../core/models/client-logs.model';

@Component({
  selector: 'app-body-state-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './body-state-list.component.html',
  styleUrl: './body-state-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BodyStateListComponent implements OnInit, OnDestroy {
  private clientLogsService = inject(ClientLogsService);
  private destroy$ = new Subject<void>();

  logs = signal<BodyStateLogResponse[]>([]);
  lastLog = signal<BodyStateLogResponse | null>(null);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.loadLogs();
    this.loadLastLog();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.error.set('');
    this.clientLogsService.getBodyStateLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logs) => {
          this.logs.set(logs);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[BodyStateListComponent] Error loading logs:', err);
          this.error.set('Failed to load body state logs');
          this.loading.set(false);
        }
      });
  }

  loadLastLog(): void {
    this.clientLogsService.getLastBodyStateLog()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (log) => this.lastLog.set(log),
        error: (err) => console.error('[BodyStateListComponent] Error loading last log:', err)
      });
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
