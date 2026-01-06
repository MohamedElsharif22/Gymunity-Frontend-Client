import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TrainerProfileService } from '../../services/trainer-profile.service';
import { TrainerCacheService } from '../../services/trainer-cache.service';
import { TrainerCard } from '../../../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Trainer Detail Component
 * Displays comprehensive trainer profile information
 *
 * Route parameter: trainerId (numeric ID)
 * Data source: TrainerProfileService.getTrainerProfile(trainerId)
 *
 * Features:
 * - Full trainer profile with cover image
 * - Trainer stats (experience, ratings, clients)
 * - Verification badge
 * - Contact/booking buttons
 * - Pricing information
 */
@Component({
  selector: 'app-trainer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 bg-gray-50 py-8 px-4 md:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Back Button -->
        <button
          (click)="goBack()"
          class="mb-6 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition"
        >
          ← Back
        </button>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="bg-white rounded-lg shadow p-8">
            <div class="flex flex-col items-center justify-center">
              <div class="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <p class="mt-4 text-gray-600">Loading trainer profile...</p>
            </div>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p class="text-red-800 font-medium">{{ error() }}</p>
            <button
              (click)="loadTrainerProfile()"
              class="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        }

        <!-- Trainer Profile -->
        @if (!isLoading() && !error() && trainer()) {
          <div class="space-y-6">
            <!-- Cover Image -->
            @if (trainer()!.coverImageUrl) {
              <div class="rounded-lg overflow-hidden shadow-lg h-64">
                <img
                  [src]="trainer()!.coverImageUrl"
                  [alt]="trainer()!.handle"
                  class="w-full h-full object-cover"
                />
              </div>
            } @else {
              <div class="rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 h-64 shadow-lg"></div>
            }

            <!-- Profile Header Card -->
            <div class="bg-white rounded-lg shadow-lg p-6 md:p-8 -mt-16 relative z-10">
              <!-- Profile Info Row -->
              <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <div
                    class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-lg"
                  >
                    {{ trainer()!.userName.charAt(0).toUpperCase() }}
                  </div>
                </div>

                <!-- Name and Basic Info -->
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h1 class="text-3xl font-bold text-gray-900">{{ trainer()!.userName }}</h1>
                    @if (trainer()!.isVerified) {
                      <div class="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <span class="text-xs font-semibold">Verified</span>
                      </div>
                    }
                  </div>

                  <p class="text-xl text-blue-600 font-semibold mb-3">@{{ trainer()!.handle }}</p>
                  @if (trainer()!.bio) {
                    <p class="text-gray-700 mb-4">{{ trainer()!.bio }}</p>
                  }

                  <!-- Quick Stats -->
                  <div class="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
                    <div>
                      <p class="text-2xl font-bold text-gray-900">{{ trainer()!.yearsExperience }}</p>
                      <p class="text-sm text-gray-600">Years Experience</p>
                    </div>
                    <div>
                      <div class="flex items-center gap-1">
                        <span class="text-2xl font-bold text-gray-900">
                          {{ trainer()!.ratingAverage.toFixed(1) }}
                        </span>
                        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                      </div>
                      <p class="text-sm text-gray-600">Rating</p>
                    </div>
                    <div>
                      <p class="text-2xl font-bold text-gray-900">{{ trainer()!.totalClients }}</p>
                      <p class="text-sm text-gray-600">Total Clients</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact and Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Book Session
              </button>
              <button
                class="flex-1 bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border border-blue-200 transition-colors"
              >
                Send Message
              </button>
            </div>

            <!-- Pricing Information -->
            @if (trainer()!.startingPrice) {
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4">Pricing</h2>
                <div class="flex items-baseline gap-2">
                  <span class="text-4xl font-bold text-gray-900">$</span>
                  <span class="text-4xl font-bold text-gray-900">
                    {{ trainer()!.startingPrice }}
                  </span>
                  <span class="text-gray-600">/ session</span>
                </div>
                <p class="text-sm text-gray-600 mt-2">Starting price for sessions</p>
              </div>
            }

            <!-- Bio Section -->
            @if (trainer()!.bio) {
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p class="text-gray-700 leading-relaxed">{{ trainer()!.bio }}</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class TrainerDetailComponent implements OnInit, OnDestroy {
  private readonly trainerProfileService = inject(TrainerProfileService);
  private readonly trainerCacheService = inject(TrainerCacheService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly destroy$ = new Subject<void>();

  trainer = signal<TrainerCard | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // First try to get trainer from navigation state (from trainers list)
    const state = this.location.getState() as any;
    if (state?.trainer) {
      this.trainer.set(state.trainer);
      console.log('[TrainerDetailComponent] Trainer loaded from navigation state:', state.trainer);
      return;
    }

    // Second try: check if trainer is cached (from auth redirect)
    const cachedTrainer = this.trainerCacheService.getCachedTrainer();
    if (cachedTrainer) {
      this.trainer.set(cachedTrainer);
      console.log('[TrainerDetailComponent] Trainer loaded from cache:', cachedTrainer);
      return;
    }

    // Fall back to loading from API if not in state or cache
    const trainerId = this.route.snapshot.paramMap.get('id');
    if (trainerId) {
      console.log('[TrainerDetailComponent] Trainer not in state or cache, attempting to load from API with ID:', trainerId);
      this.loadTrainerProfile(trainerId);
    } else {
      this.error.set('No trainer information provided. Please navigate from the trainers list.');
    }
  }

  loadTrainerProfile(trainerHandle?: string): void {
    const handle = trainerHandle || this.route.snapshot.paramMap.get('id');
    if (!handle) {
      this.error.set('No trainer handle provided');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.trainerProfileService
      .getTrainerProfile(handle)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: TrainerCard) => {
          this.trainer.set(profile);
          this.isLoading.set(false);
          console.log('[TrainerDetailComponent] Trainer profile loaded:', profile);
        },
        error: (err: any) => {
          this.isLoading.set(false);
          console.error('[TrainerDetailComponent] Error loading trainer profile:', err);
          console.log('[TrainerDetailComponent] Error details - URL:', err?.url);
          console.log('[TrainerDetailComponent] Error details - Status:', err?.status);
          console.log('[TrainerDetailComponent] Error details - Message:', err?.error?.message);
          
          // If API fails (404, 403, etc.), show user-friendly error message
          let errorMessage = 'Failed to load trainer profile.';
          if (err?.status === 404) {
            errorMessage = 'Trainer profile not found. Please go back and try again.';
          } else if (err?.status === 403) {
            errorMessage = 'You do not have permission to view this trainer profile.';
          } else if (err?.status === 0) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          }
          
          this.error.set(errorMessage);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/trainers']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
