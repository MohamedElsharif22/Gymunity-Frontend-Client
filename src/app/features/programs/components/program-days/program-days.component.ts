import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ClientProgramsService } from '../../services/client-programs.service';
import { ProgramDayResponse } from '../../../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Program Days Component
 * Displays all days in a program week
 *
 * Responsibility:
 * - Fetch and display days for a specific week
 * - Navigate to individual day's exercises
 * - Show day sequence within week
 *
 * Route parameters: weekId (passed from program-weeks component)
 * Service method: ClientProgramsService.getDaysByWeekId(weekId)
 */
@Component({
  selector: 'app-program-days',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <button
            (click)="goBack()"
            class="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium mb-4"
          >
            ← Back
          </button>
          <h1 class="text-4xl font-bold text-gray-900">Week Days</h1>
          <p class="text-gray-600 mt-2">Your workouts for this week</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="bg-white rounded-lg shadow p-8">
          <div class="flex items-center justify-center space-x-3">
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
            <span class="text-gray-600 ml-4">Loading days...</span>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error() }}
        </div>

        <!-- Days List -->
        <div *ngIf="!loading() && days().length > 0" class="space-y-4">
          <div
            *ngFor="let day of days()"
            [routerLink]="['/programs/days', day.id]"
            class="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-shadow p-6"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-6">
                <div class="bg-sky-600 text-white rounded-full w-16 h-16 flex items-center justify-center">
                  <span class="text-2xl font-bold">{{ day.dayNumber }}</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900">{{ day.title || 'Day ' + day.dayNumber }}</h3>
                  <p class="text-gray-600 text-sm">{{ day.exercises.length }} exercises</p>
                  <p *ngIf="day.notes" class="text-gray-500 text-sm mt-1">{{ day.notes }}</p>
                </div>
              </div>
              <div class="text-gray-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && days().length === 0" class="bg-white rounded-lg shadow p-12 text-center">
          <p class="text-gray-600">No days scheduled for this week.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProgramDaysComponent implements OnInit, OnDestroy {
  private programsService = inject(ClientProgramsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  days = signal<ProgramDayResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const weekId = this.route.snapshot.paramMap.get('weekId');
    if (weekId) {
      this.loadDays(weekId);
    }
  }

  private loadDays(weekId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.programsService
      .getDaysByWeekId(weekId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (days) => {
          this.days.set(days);
          this.loading.set(false);
          console.log('[ProgramDaysComponent] Days loaded:', days);
        },
        error: (err) => {
          this.loading.set(false);
          const errorMessage = err.error?.message || err.error?.errors?.[0] || 'Failed to load days.';
          this.error.set(errorMessage);
          console.error('[ProgramDaysComponent] Error loading days:', err);
        }
      });
  }

  goBack() {
    this.router.navigate(['/programs']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
