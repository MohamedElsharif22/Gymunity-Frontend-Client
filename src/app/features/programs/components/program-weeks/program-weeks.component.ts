import { Component, inject, signal, ChangeDetectionStrategy, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProgramService, ProgramWeek } from '../../services/program.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Program Weeks Component
 * Displays all weeks in a program
 *
 * Responsibility:
 * - Fetch and display weeks for a specific program
 * - Navigate to individual week's days
 * - Show week progression
 *
 * Route parameters: programId
 * Service method: ProgramService.getProgramWeeks(programId)
 */
@Component({
  selector: 'app-program-weeks',
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
          <h1 class="text-4xl font-bold text-gray-900">Program Weeks</h1>
          <p class="text-gray-600 mt-2">Progress through your training program</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="bg-white rounded-lg shadow p-8">
          <div class="flex items-center justify-center space-x-3">
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
            <span class="text-gray-600 ml-4">Loading weeks...</span>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error() }}
        </div>

        <!-- Weeks Timeline -->
        <div *ngIf="!loading() && weeks().length > 0" class="space-y-4">
          <div
            *ngFor="let week of weeks()"
            [routerLink]="['/programs/weeks', week.id, 'days']"
            class="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-shadow p-6"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-6">
                <div class="bg-sky-600 text-white rounded-full w-16 h-16 flex items-center justify-center">
                  <span class="text-2xl font-bold">W{{ week.weekNumber }}</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900">Week {{ week.weekNumber }}</h3>
                  <p class="text-gray-600 text-sm">Program ID: {{ week.programId }}</p>
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
        <div *ngIf="!loading() && weeks().length === 0" class="bg-white rounded-lg shadow p-12 text-center">
          <p class="text-gray-600">No weeks found in this program.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProgramWeeksComponent implements OnInit {
  private programsService = inject(ProgramService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  weeks = signal<ProgramWeek[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const programId = this.route.snapshot.paramMap.get('programId');
    if (programId) {
      this.loadWeeks(programId);
    }
  }

  private loadWeeks(programId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.programsService
      .getProgramWeeks(+programId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (weeks) => {
          this.weeks.set(weeks);
          this.loading.set(false);
          console.log('[ProgramWeeksComponent] Weeks loaded:', weeks);
        },
        error: (err) => {
          this.loading.set(false);
          const errorMessage = err.error?.message || err.error?.errors?.[0] || 'Failed to load weeks.';
          this.error.set(errorMessage);
          console.error('[ProgramWeeksComponent] Error loading weeks:', err);
        }
      });
  }

  goBack() {
    this.router.navigate(['/programs']);
  }
}
