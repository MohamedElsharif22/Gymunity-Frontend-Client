import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TrainerProfileService } from '../../services/trainer-profile.service';
import { HomeClientService } from '../../services/home-client.service';
import { TrainerCard } from '../../../../core/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-trainer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Facebook-Style Profile Layout -->
    <div class="min-h-screen bg-gray-100">
      <!-- Loading State -->
      @if (isLoading()) {
        <div class="max-w-5xl mx-auto px-4 py-8">
          <div class="bg-white rounded-lg shadow p-12 text-center">
            <div class="w-16 h-16 border-4 border-gray-200 border-t-sky-600 rounded-full animate-spin mx-auto"></div>
            <p class="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="max-w-5xl mx-auto px-4 py-8">
          <div class="bg-white rounded-lg shadow p-8">
            <div class="text-center">
              <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
              <p class="text-gray-600 mb-4">{{ error() }}</p>
              <button
                (click)="loadTrainerProfile()"
                class="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Profile Content -->
      @if (!isLoading() && !error() && trainer()) {
        <div class="max-w-5xl mx-auto">
          <!-- Cover Photo Section -->
          <div class="bg-white shadow">
            <div class="relative">
              <!-- Cover Image -->
              <div class="h-[450px] bg-gradient-to-br from-sky-400 via-sky-500 to-cyan-500 overflow-hidden">
                @if (trainer()!.coverImageUrl) {
                  <img
                    [src]="trainer()!.coverImageUrl"
                    [alt]="trainer()!.userName"
                    class="w-full h-full object-cover"
                  />
                } @else {
                  <!-- Gradient fallback with pattern -->
                  <div class="w-full h-full bg-gradient-to-br from-sky-400 via-sky-500 to-cyan-500 opacity-90"></div>
                }
              </div>

              <!-- Back Button (Top Left on Cover) -->
              <button
                (click)="goBack()"
                class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-all"
                title="Go back"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              <!-- Profile Info Container -->
              <div class="px-4 md:px-8 pb-4">
                <!-- Avatar & Name Row -->
                <div class="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 relative">
                  <!-- Avatar -->
                  <div class="flex items-end gap-4">
                    <div class="relative">
                      <div class="w-40 h-40 rounded-full bg-white p-1 shadow-xl">
                        @if (trainer()!.profilePhotoUrl) {
                          <img
                            [src]="trainer()!.profilePhotoUrl"
                            [alt]="trainer()!.userName"
                            class="w-full h-full rounded-full object-cover"
                          />
                        } @else {
                          <div class="w-full h-full rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white font-bold text-5xl">
                            {{ trainer()!.userName.charAt(0).toUpperCase() }}
                          </div>
                        }
                      </div>
                      <!-- Online Status -->
                      <div class="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
                    </div>

                    <!-- Name & Handle (Desktop) -->
                    <div class="hidden md:block mb-4">
                      <div class="flex items-center gap-2">
                        <h1 class="text-3xl font-bold text-gray-900">{{ trainer()!.userName }}</h1>
                        @if (trainer()!.isVerified) {
                          <svg class="w-6 h-6 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                        }
                      </div>
                      <p class="text-gray-600 mt-1">{{ '@' + trainer()!.handle }}</p>
                      @if (trainer()!.totalClients) {
                        <p class="text-sm text-gray-500 mt-1">{{ trainer()!.totalClients }} clients</p>
                      }
                    </div>
                  </div>

                  <!-- Action Buttons (Desktop) -->
                  <div class="hidden md:flex items-center gap-2 mb-4">
                    <button
                      (click)="viewAllPackages()"
                      class="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                      Subscribe
                    </button>
                    <button
                      (click)="sendMessage()"
                      class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
                    >
                      Message
                    </button>
                    <button
                      class="p-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
                      title="More options"
                    >
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Name & Handle (Mobile) -->
                <div class="md:hidden mt-4">
                  <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-bold text-gray-900">{{ trainer()!.userName }}</h1>
                    @if (trainer()!.isVerified) {
                      <svg class="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    }
                  </div>
                  <p class="text-gray-600 mt-1">{{ '@' + trainer()!.handle }}</p>
                  @if (trainer()!.totalClients) {
                    <p class="text-sm text-gray-500 mt-1">{{ trainer()!.totalClients }} clients</p>
                  }
                </div>

                <!-- Navigation Tabs -->
                <div class="border-t border-gray-200 mt-4">
                  <div class="flex gap-1 overflow-x-auto">
                    <button
                      [class.border-sky-600]="activeTab() === 'about'"
                      [class.text-sky-600]="activeTab() === 'about'"
                      [class.text-gray-600]="activeTab() !== 'about'"
                      (click)="activeTab.set('about')"
                      class="px-4 py-3 font-semibold border-b-4 border-transparent hover:bg-gray-50 rounded-t-lg transition-colors whitespace-nowrap"
                    >
                      About
                    </button>
                    <button
                      [class.border-sky-600]="activeTab() === 'packages'"
                      [class.text-sky-600]="activeTab() === 'packages'"
                      [class.text-gray-600]="activeTab() !== 'packages'"
                      (click)="activeTab.set('packages')"
                      class="px-4 py-3 font-semibold border-b-4 border-transparent hover:bg-gray-50 rounded-t-lg transition-colors whitespace-nowrap"
                    >
                      Packages
                    </button>
                    <button
                      [class.border-sky-600]="activeTab() === 'programs'"
                      [class.text-sky-600]="activeTab() === 'programs'"
                      [class.text-gray-600]="activeTab() !== 'programs'"
                      (click)="activeTab.set('programs')"
                      class="px-4 py-3 font-semibold border-b-4 border-transparent hover:bg-gray-50 rounded-t-lg transition-colors whitespace-nowrap"
                    >
                      Programs
                    </button>
                    <button
                      [class.border-sky-600]="activeTab() === 'reviews'"
                      [class.text-sky-600]="activeTab() === 'reviews'"
                      [class.text-gray-600]="activeTab() !== 'reviews'"
                      (click)="activeTab.set('reviews')"
                      class="px-4 py-3 font-semibold border-b-4 border-transparent hover:bg-gray-50 rounded-t-lg transition-colors whitespace-nowrap"
                    >
                      Reviews
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons (Mobile) -->
            <div class="md:hidden px-4 pb-4 flex gap-2">
              <button
                (click)="viewAllPackages()"
                class="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors"
              >
                Subscribe
              </button>
              <button
                (click)="sendMessage()"
                class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Message
              </button>
              <button
                class="p-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content Area -->
          <div class="px-4 md:px-8 py-4">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <!-- Left Sidebar -->
              <div class="lg:col-span-1 space-y-4">
                <!-- Intro Card -->
                <div class="bg-white rounded-lg shadow p-4">
                  <h2 class="text-xl font-bold text-gray-900 mb-4">Intro</h2>
                  
                  @if (trainer()!.bio) {
                    <p class="text-gray-700 text-sm mb-4 leading-relaxed">{{ trainer()!.bio }}</p>
                  }

                  <!-- Stats -->
                  <div class="space-y-3">
                    @if (trainer()!.yearsExperience) {
                      <div class="flex items-center gap-3 text-gray-700">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        <span class="text-sm"><span class="font-semibold">{{ trainer()!.yearsExperience }}</span> years of experience</span>
                      </div>
                    }

                    @if (trainer()!.ratingAverage) {
                      <div class="flex items-center gap-3 text-gray-700">
                        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span class="text-sm"><span class="font-semibold">{{ trainer()!.ratingAverage.toFixed(1) }}</span> rating ({{ trainer()!.totalReviews }} reviews)</span>
                      </div>
                    }

                    @if (trainer()!.startingPrice) {
                      <div class="flex items-center gap-3 text-gray-700">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="text-sm">Starting at <span class="font-semibold">\${{ trainer()!.startingPrice }}</span></span>
                      </div>
                    }

                    @if (trainer()!.specializations?.length) {
                      <div class="flex items-start gap-3 text-gray-700">
                        <svg class="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div class="flex-1">
                          <p class="text-sm font-semibold mb-2">Specializations</p>
                          <div class="flex flex-wrap gap-1.5">
                            @for (spec of trainer()!.specializations; track spec) {
                              <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{{ spec }}</span>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Main Content -->
              <div class="lg:col-span-2 space-y-4">
                <!-- About Tab -->
                @if (activeTab() === 'about') {
                  @if (trainer()!.bio) {
                    <div class="bg-white rounded-lg shadow p-6">
                      <h2 class="text-xl font-bold text-gray-900 mb-4">About</h2>
                      <p class="text-gray-700 leading-relaxed">{{ trainer()!.bio }}</p>
                    </div>
                  }
                }

                <!-- Packages Tab -->
                @if (activeTab() === 'packages') {
                  <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-6">
                      <h2 class="text-xl font-bold text-gray-900">Packages</h2>
                      @if (packages().length > 0) {
                        <button
                          (click)="viewAllPackages()"
                          class="text-sky-600 hover:text-sky-700 font-semibold text-sm"
                        >
                          View all
                        </button>
                      }
                    </div>

                    @if (loadingPackages()) {
                      <div class="text-center py-8 text-gray-600">Loading packages...</div>
                    } @else if (packages().length === 0) {
                      <div class="text-center py-12">
                        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                        </svg>
                        <p class="text-gray-600">No packages available</p>
                      </div>
                    } @else {
                      <div class="space-y-4">
                        @for (pkg of packages(); track pkg.id) {
                          <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer" (click)="viewPackage(pkg.id)">
                            <!-- Package Image -->
                            @if (pkg.thumbnailUrl) {
                              <img [src]="pkg.thumbnailUrl" [alt]="pkg.name" class="w-full h-48 object-cover"/>
                            } @else {
                              <div class="w-full h-48 bg-gradient-to-br from-sky-400 to-sky-600"></div>
                            }
                            <!-- Package Info -->
                            <div class="p-4">
                              <div class="flex items-start justify-between">
                                <div class="flex-1">
                                  <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ pkg.name }}</h3>
                                  @if (pkg.description) {
                                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ pkg.description }}</p>
                                  }
                                  <div class="flex items-center gap-4 text-sm">
                                    <span class="text-gray-700"><span class="font-semibold">\${{ pkg.priceMonthly }}</span>/month</span>
                                    <span class="text-gray-700"><span class="font-semibold">\${{ pkg.priceYearly }}</span>/year</span>
                                  </div>
                                </div>
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }

                <!-- Programs Tab -->
                @if (activeTab() === 'programs') {
                  <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-6">
                      <h2 class="text-xl font-bold text-gray-900">Programs</h2>
                      @if (trainerPrograms().length > 0) {
                        <button
                          (click)="viewAllPrograms()"
                          class="text-sky-600 hover:text-sky-700 font-semibold text-sm"
                        >
                          View all
                        </button>
                      }
                    </div>

                    @if (loadingPrograms()) {
                      <div class="text-center py-8 text-gray-600">Loading programs...</div>
                    } @else if (trainerPrograms().length === 0) {
                      <div class="text-center py-12">
                        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <p class="text-gray-600">No programs available</p>
                      </div>
                    } @else {
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        @for (program of trainerPrograms(); track program.id) {
                          <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer" (click)="viewProgram(program.id)">
                            @if (program.thumbnailUrl) {
                              <img [src]="program.thumbnailUrl" [alt]="program.title" class="w-full h-32 object-cover"/>
                            } @else {
                              <div class="w-full h-32 bg-gradient-to-br from-sky-400 to-sky-600"></div>
                            }
                            <div class="p-4">
                              <h3 class="font-semibold text-gray-900 mb-1">{{ program.title }}</h3>
                              @if (program.description) {
                                <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ program.description }}</p>
                              }
                              <div class="flex items-center gap-3 text-xs text-gray-500">
                                <span>{{ program.durationWeeks }} weeks</span>
                                <span>•</span>
                                <span class="capitalize">{{ program.type }}</span>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }

                <!-- Reviews Tab -->
                @if (activeTab() === 'reviews') {
                  <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-6">Reviews</h2>
                    <div class="text-center py-12 text-gray-600">
                      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                      </svg>
                      Reviews coming soon
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class TrainerDetailComponent implements OnInit {
  private readonly trainerProfileService = inject(TrainerProfileService);
  private readonly homeClientService = inject(HomeClientService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  trainer = signal<TrainerCard | null>(null);
  packages = signal<any[]>([]);
  trainerPrograms = signal<any[]>([]);
  isLoading = signal(false);
  loadingPackages = signal(false);
  loadingPrograms = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<'about' | 'packages' | 'programs' | 'reviews'>('about');

  ngOnInit(): void {
    const state = this.location.getState() as any;
    if (state?.trainer) {
      this.trainer.set(state.trainer);
      this.loadTrainerPackages(state.trainer.id);
      this.loadTrainerPrograms(state.trainer.id);
      return;
    }

    const trainerId = this.route.snapshot.paramMap.get('id');
    if (trainerId) {
      this.loadTrainerProfile(trainerId);
    } else {
      this.error.set('No trainer information provided');
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile: TrainerCard) => {
          this.trainer.set(profile);
          this.isLoading.set(false);
          this.loadTrainerPackages(profile.id);
          this.loadTrainerPrograms(profile.id);
        },
        error: (err: any) => {
          this.isLoading.set(false);
          this.error.set(this.getErrorMessage(err));
        }
      });
  }

  loadTrainerPackages(trainerId: number): void {
    this.loadingPackages.set(true);
    this.homeClientService
      .getPackagesByTrainer(trainerId.toString())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (packages: any[]) => {
          this.packages.set(packages);
          this.loadingPackages.set(false);
        },
        error: (err: any) => {
          this.loadingPackages.set(false);
          console.error('Error loading packages:', err);
        }
      });
  }

  loadTrainerPrograms(trainerId: number): void {
    this.loadingPrograms.set(true);
    this.homeClientService
      .getAllPrograms()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (allPrograms: any[]) => {
          const filtered = allPrograms.filter(p => p.trainerProfileId === trainerId);
          this.trainerPrograms.set(filtered);
          this.loadingPrograms.set(false);
        },
        error: (err: any) => {
          this.loadingPrograms.set(false);
          console.error('Error loading programs:', err);
        }
      });
  }

  getErrorMessage(err: any): string {
    if (err?.status === 404) {
      return 'Trainer not found.';
    } else if (err?.status === 403) {
      return 'You do not have permission to view this profile.';
    } else if (err?.status === 0) {
      return 'Network error. Please check your connection.';
    }
    return 'Failed to load trainer profile.';
  }

  viewPackage(packageId: number): void {
    this.router.navigate(['/packages', packageId]);
  }

  viewAllPackages(): void {
    const trainerId = this.trainer()?.id;
    if (trainerId) {
      this.router.navigate(['/discover/trainers', trainerId, 'packages']);
    }
  }

  viewAllPrograms(): void {
    const trainerId = this.trainer()?.id;
    if (trainerId) {
      this.router.navigate(['/discover/trainers', trainerId, 'programs']);
    }
  }

  viewProgram(programId: number): void {
    this.router.navigate(['/discover/programs', programId]);
  }

  sendMessage(): void {
    const trainerId = this.trainer()?.id;
    if (trainerId) {
      this.router.navigate(['/chat'], { queryParams: { trainerId } });
    }
  }

  goBack(): void {
    this.location.back();
  }
}