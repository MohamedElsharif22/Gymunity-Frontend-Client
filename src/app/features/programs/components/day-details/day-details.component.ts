import { Component, inject, signal, ChangeDetectionStrategy, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProgramService, ProgramDay } from '../../services/program.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Day Details Component
 * Displays a single program day with all exercises and their details
 *
 * Responsibility:
 * - Fetch and display day details with exercises
 * - Show exercise-specific information (sets, reps, rest, tempo)
 * - Display video links and exercise videos
 * - Show muscle groups and equipment
 *
 * Route parameters: dayId
 * Service method: ProgramService.getExercisesByDayId(dayId)
 */
@Component({
  selector: 'app-day-details',
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
          <h1 class="text-4xl font-bold text-gray-900">{{ day()?.title || 'Day Details' }}</h1>
          <p *ngIf="day()?.notes" class="text-gray-600 mt-2">{{ day()!.notes }}</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="bg-white rounded-lg shadow p-8">
          <div class="flex items-center justify-center space-x-3">
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
            <span class="text-gray-600 ml-4">Loading day details...</span>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error() }}
        </div>

        <!-- Day Exercises -->
        <div *ngIf="!loading() && day()" class="space-y-6">
          <!-- Exercise List -->
          <div *ngIf="(day()?.exercises || []).length > 0" class="space-y-4">
            <div
              *ngFor="let exercise of (day()?.exercises || [])"
              class="bg-white rounded-lg shadow p-6"
            >
              <!-- Exercise Header -->
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-2xl font-bold text-gray-900">
                    {{ exercise.orderIndex }}. {{ exercise.excersiceName }}
                  </h3>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span class="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {{ exercise.category }}
                    </span>
                    <span class="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-sm rounded">
                      {{ exercise.muscleGroup }}
                    </span>
                    <span class="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded">
                      {{ exercise.equipment }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Exercise Video -->
              <div *ngIf="exercise.videoDemoUrl" class="mb-6">
                <a
                  [href]="exercise.videoDemoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium"
                >
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                  </svg>
                  Watch Demo Video
                </a>
              </div>

              <!-- Exercise Specs Grid -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded">
                <div>
                  <span class="text-gray-600 text-sm">Sets</span>
                  <p class="font-bold text-lg text-gray-900">{{ exercise.sets }}</p>
                </div>
                <div>
                  <span class="text-gray-600 text-sm">Reps</span>
                  <p class="font-bold text-lg text-gray-900">{{ exercise.reps }}</p>
                </div>
                <div>
                  <span class="text-gray-600 text-sm">Rest</span>
                  <p class="font-bold text-lg text-gray-900">{{ exercise.restSeconds }}s</p>
                </div>
                <div>
                  <span class="text-gray-600 text-sm">Tempo</span>
                  <p class="font-bold text-lg text-gray-900">{{ exercise.tempo || '—' }}</p>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="space-y-2 text-sm">
                <div *ngIf="exercise.rpe" class="text-gray-700">
                  <span class="font-semibold">RPE:</span> {{ exercise.rpe }}
                </div>
                <div *ngIf="exercise.percent1RM" class="text-gray-700">
                  <span class="font-semibold">% 1RM:</span> {{ exercise.percent1RM }}
                </div>
                <div *ngIf="exercise.notes" class="text-gray-700 bg-blue-50 p-3 rounded">
                  <span class="font-semibold">Notes:</span> {{ exercise.notes }}
                </div>
              </div>
            </div>
          </div>

          <!-- No Exercises State -->
          <div *ngIf="!day()?.exercises || (day()?.exercises || []).length === 0" class="bg-white rounded-lg shadow p-12 text-center">
            <p class="text-gray-600">No exercises scheduled for this day.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DayDetailsComponent implements OnInit {
  private programsService = inject(ProgramService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  day = signal<ProgramDay | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const dayId = this.route.snapshot.paramMap.get('dayId');
    if (dayId) {
      this.loadDayDetails(dayId);
    }
  }

  private loadDayDetails(dayId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.programsService
      .getExercisesByDayId(+dayId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (day) => {
          console.log('[DayDetailsComponent] Day loaded from API:', day);
          console.log('[DayDetailsComponent] Exercises count:', day.exercises?.length ?? 0);
          console.log('[DayDetailsComponent] Exercises data:', day.exercises);
          
          this.day.set(day);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          const errorMessage = err.error?.message || err.error?.errors?.[0] || 'Failed to load day details.';
          this.error.set(errorMessage);
          console.error('[DayDetailsComponent] Error loading day:', err);
        }
      });
  }

  goBack() {
    this.router.navigate(['/programs']);
  }
}
