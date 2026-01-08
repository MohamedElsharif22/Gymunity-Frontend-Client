import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProgramService, ProgramWeek } from '../../services/program.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Program Weeks Component
 * Displays all weeks in a program with professional card-based design
 *
 * Responsibility:
 * - Fetch and display weeks for a specific program
 * - Navigate to individual week's days
 * - Show week progression with visual indicators
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
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div class="max-w-5xl mx-auto">
        <!-- Back Button & Header -->
        <div class="mb-8">
          <button
            (click)="goBack()"
            class="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold mb-6 group transition"
          >
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Programs
          </button>
          <div>
            <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Program Weeks
            </h1>
            <p class="text-gray-600 text-lg">Progress through your training program week by week</p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="flex items-center justify-center py-20">
          <div class="relative">
            <div class="w-20 h-20 border-4 border-sky-200 rounded-full"></div>
            <div class="w-20 h-20 border-4 border-sky-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-white border-l-4 border-red-500 rounded-2xl shadow-lg p-6 mb-8">
          <div class="flex items-start gap-4">
            <div class="bg-red-100 rounded-full p-3">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-red-900">Unable to Load Weeks</h3>
              <p class="text-red-700 mt-1">{{ error() }}</p>
            </div>
          </div>
        </div>

        <!-- Weeks Grid -->
        <div *ngIf="!loading() && weeks().length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            *ngFor="let week of weeks(); let i = index"
            [routerLink]="['/programs/weeks', week.id, 'days']"
            class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-100"
          >
            <!-- Week Header -->
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
              <div class="flex items-start justify-between mb-4">
                <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p class="text-sm font-semibold text-indigo-100">WEEK {{ week.weekNumber }}</p>
                </div>
                <div class="text-indigo-100">
                  <svg class="w-6 h-6 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </div>
              </div>
              <h3 class="text-3xl font-bold">Week {{ week.weekNumber }}</h3>
              <p class="text-indigo-100 text-sm mt-2">Program #{{ week.programId }}</p>
            </div>

            <!-- Week Content -->
            <div class="p-8">
              <!-- Training Days Indicator -->
              <div class="mb-6">
                <p class="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-3">Training Structure</p>
                <div class="flex gap-2 flex-wrap">
                  <span class="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">4 Days/Week</span>
                  <span class="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">Structured</span>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-4 text-center border border-sky-200">
                  <p class="text-gray-600 text-xs font-semibold mb-1 uppercase">Days</p>
                  <p class="text-3xl font-bold text-sky-600">4</p>
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center border border-purple-200">
                  <p class="text-gray-600 text-xs font-semibold mb-1 uppercase">Exercises</p>
                  <p class="text-3xl font-bold text-purple-600">12+</p>
                </div>
              </div>

              <!-- View Button -->
              <button class="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg group-hover:shadow-xl transition-all flex items-center justify-center gap-2">
                <span>View Week Details</span>
                <svg class="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && weeks().length === 0" class="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div class="mb-4">
            <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No Weeks Found</h3>
          <p class="text-gray-600">This program doesn't have any weeks yet.</p>
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
