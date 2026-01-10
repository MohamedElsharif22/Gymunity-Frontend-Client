import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HomeClientService } from '../services/home-client.service';
import { TrainerCard, TrainerSearchOptions } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-100 p-6 md:p-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h1 class="text-5xl font-bold text-gray-900 mb-2">Find Trainers</h1>
              <p class="text-lg text-gray-600">Discover and connect with professional fitness trainers</p>
            </div>
          </div>
        </div>

        <!-- Search and Filter Section -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Search Input -->
            <div>
              <label for="search" class="block text-sm font-semibold text-gray-900 mb-3">
                Search Trainers
              </label>
              <input
                id="search"
                type="text"
                [value]="searchTerm()"
                (input)="onSearchChange($event)"
                placeholder="Name, specialty, or handle..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
            </div>

            <!-- Specialty Filter -->
            <div>
              <label for="specialty" class="block text-sm font-semibold text-gray-900 mb-3">
                Specialization
              </label>
              <select
                id="specialty"
                [value]="selectedSpecialty()"
                (change)="onSpecialtyChange($event)"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              >
                <option value="">All Specializations</option>
                @for (specialty of availableSpecialties(); track specialty) {
                  <option [value]="specialty">{{ specialty }}</option>
                }
              </select>
            </div>

            <!-- Experience Filter -->
            <div>
              <label for="experience" class="block text-sm font-semibold text-gray-900 mb-3">
                Min. Experience
              </label>
              <select
                id="experience"
                [value]="minExperience()"
                (change)="onExperienceChange($event)"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              >
                <option value="">Any</option>
                <option value="1">1+ years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
              </select>
            </div>

            <!-- Sort By -->
            <div>
              <label for="sortBy" class="block text-sm font-semibold text-gray-900 mb-3">
                Sort By
              </label>
              <select
                id="sortBy"
                [value]="sortBy()"
                (change)="onSortChange($event)"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              >
                <option value="">Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="reviews">Most Reviewed</option>
                <option value="price">Price (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Results Info -->
        <div class="mb-6 text-sm text-gray-600 font-medium">
          @if (totalCount() > 0) {
            <p>
              Showing <span class="text-gray-900 font-bold">{{ filteredTrainers().length }}</span> of <span class="text-gray-900 font-bold">{{ totalCount() }}</span> trainers
              @if (searchTerm()) {
                matching "<span class="text-gray-900 font-semibold">{{ searchTerm() }}</span>"
              }
            </p>
          }
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-14 w-14 border-4 border-sky-200 border-t-sky-600 mb-4"></div>
            <p class="text-gray-600 text-lg font-medium">Loading trainers...</p>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="bg-red-50 border border-red-300 rounded-2xl p-8 text-center">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0H9m3 0h3"></path>
              </svg>
            </div>
            <p class="text-red-800 font-medium text-lg mb-6">{{ error() }}</p>
            <button
              (click)="loadTrainers()"
              class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              Try Again
            </button>
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading() && !error() && filteredTrainers().length === 0) {
          <div class="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div class="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 00-20 0v2h2v-2z"/>
              </svg>
            </div>
            <p class="text-gray-900 text-xl font-bold mb-2">No trainers found</p>
            <p class="text-gray-600">Try adjusting your search or filters</p>
          </div>
        }

        <!-- Trainers Grid -->
        @if (!isLoading() && !error() && filteredTrainers().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (trainer of filteredTrainers(); track trainer.id) {
              <article 
                class="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-sky-300 transition-all duration-300 cursor-pointer"
                (click)="viewTrainerProfile(trainer)"
              >
                <!-- Cover Image with Overlay -->
                <div class="relative h-56 bg-gradient-to-br from-sky-400 to-indigo-600 overflow-hidden">
                  @if (trainer.coverImageUrl) {
                    <img 
                      [src]="trainer.coverImageUrl" 
                      [alt]="trainer.userName"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <!-- Dark overlay for better text contrast -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-6xl">💪</div>
                  }
                  
                  <!-- Verified Badge (Top Right) -->
                  @if (trainer.isVerified) {
                    <div class="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <svg class="w-4 h-4 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      <span class="text-xs font-semibold text-gray-900">Verified</span>
                    </div>
                  }

                  <!-- Active Badge (Top Left) -->
                  @if (trainer.hasActiveSubscription) {
                    <div class="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      ✓ Active
                    </div>
                  }
                </div>

                <!-- Content -->
                <div class="p-6">
                  <!-- Avatar & Name (Overlapping cover) -->
                  <div class="flex items-start gap-4 -mt-14 mb-5">
                    <div class="relative">
                      <div class="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden flex-shrink-0">
                        @if (trainer.coverImageUrl) {
                          <img 
                            [src]="trainer.coverImageUrl" 
                            [alt]="trainer.userName"
                            class="w-full h-full object-cover"
                          />
                        } @else {
                          <div class="w-full h-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                            {{ trainer.userName.charAt(0).toUpperCase() || 'T' }}
                          </div>
                        }
                      </div>
                      <!-- Online Status Indicator -->
                      @if (trainer.hasActiveSubscription) {
                        <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                      }
                    </div>
                    <!-- Name & Handle -->
                    <div class="flex-1 pt-10">
                      <h3 class="text-xl font-bold text-gray-900 mb-0.5 group-hover:text-sky-600 transition-colors">
                        {{ trainer.userName || 'Trainer' }}
                      </h3>
                      @if (trainer.handle) {
                        <p class="text-sm text-sky-600 font-semibold">{{ '@' + trainer.handle }}</p>
                      }
                    </div>
                  </div>

                  <!-- Rating & Reviews -->
                  @if (trainer.ratingAverage || trainer.totalReviews) {
                    <div class="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                      <div class="flex items-center gap-1">
                        @for (i of [1, 2, 3, 4, 5]; track i) {
                          <svg 
                            [class]="i <= Math.round(trainer.ratingAverage || 0) ? 'text-yellow-400' : 'text-gray-300'"
                            class="w-4 h-4" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        }
                      </div>
                      <span class="text-sm font-semibold text-gray-900">{{ (trainer.ratingAverage || 0).toFixed(1) }}</span>
                      @if (trainer.totalReviews) {
                        <span class="text-sm text-gray-500">({{ trainer.totalReviews }})</span>
                      }
                    </div>
                  }

                  <!-- Bio -->
                  @if (trainer.bio) {
                    <p class="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {{ trainer.bio }}
                    </p>
                  }

                  <!-- Stats Grid -->
                  <div class="grid grid-cols-3 gap-3 py-4 border-b border-gray-200 mb-4">
                    <!-- Experience -->
                    <div class="text-center">
                      <p class="text-lg font-bold text-sky-600">
                        {{ trainer.yearsExperience || 0 }}
                      </p>
                      <p class="text-xs text-gray-600 font-medium">Years</p>
                    </div>
                    
                    <!-- Clients -->
                    @if (trainer.totalClients) {
                      <div class="text-center">
                        <p class="text-lg font-bold text-sky-600">{{ trainer.totalClients }}</p>
                        <p class="text-xs text-gray-600 font-medium">Clients</p>
                      </div>
                    }
                    
                    <!-- Rating (simplified) -->
                    <div class="text-center">
                      <p class="text-lg font-bold text-sky-600">{{ (trainer.ratingAverage || 0).toFixed(1) }}</p>
                      <p class="text-xs text-gray-600 font-medium">Rating</p>
                    </div>
                  </div>

                  <!-- Price & CTA -->
                  <div class="flex items-center justify-between gap-3">
                    @if (trainer.startingPrice) {
                      <div class="flex flex-col">
                        <span class="text-xs text-gray-600 font-medium">Starting at</span>
                        <div class="flex items-baseline gap-1">
                          <span class="text-2xl font-bold text-gray-900">\${{ trainer.startingPrice }}</span>
                          <span class="text-sm text-gray-600">/session</span>
                        </div>
                      </div>
                    }
                    
                    <button
                      (click)="viewTrainerProfile(trainer); $event.stopPropagation()"
                      class="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group transform hover:-translate-y-0.5"
                    >
                      <span>Profile</span>
                      <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </div>
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
export class TrainersComponent implements OnInit {
  private readonly homeClientService = inject(HomeClientService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // State signals
  trainers = signal<TrainerCard[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  searchTerm = signal('');
  selectedSpecialty = signal('');
  minExperience = signal('');
  sortBy = signal('');
  totalCount = signal(0);
  Math = Math;

  // Computed signals
  availableSpecialties = computed(() => {
    // No specializations in the new API response
    return [];
  });

  filteredTrainers = computed(() => {
    let filtered = this.trainers();
    const search = this.searchTerm().toLowerCase();
    const minExp = this.minExperience() ? parseInt(this.minExperience()) : null;

    // Filter by search term
    if (search) {
      filtered = filtered.filter(
        trainer =>
          trainer.userName.toLowerCase().includes(search) ||
          trainer.handle.toLowerCase().includes(search) ||
          trainer.bio?.toLowerCase().includes(search)
      );
    }

    // Filter by experience
    if (minExp !== null) {
      filtered = filtered.filter(trainer => trainer.yearsExperience >= minExp);
    }

    // Sort
    const sort = this.sortBy();
    if (sort === 'rating') {
      filtered.sort((a, b) => b.ratingAverage - a.ratingAverage);
    } else if (sort === 'experience') {
      filtered.sort((a, b) => b.yearsExperience - a.yearsExperience);
    } else if (sort === 'reviews') {
      filtered.sort((a, b) => b.totalReviews - a.totalReviews);
    } else if (sort === 'price') {
      filtered.sort((a, b) => (a.startingPrice ?? 0) - (b.startingPrice ?? 0));
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.homeClientService.getAllTrainers().subscribe({
      next: response => {
        const trainers = (response || []) as unknown as TrainerCard[];
        this.trainers.set(trainers);
        this.totalCount.set(trainers.length);
        this.isLoading.set(false);
        console.log('[TrainersComponent] Loaded trainers:', trainers.length);
      },
      error: err => {
        console.error('[TrainersComponent] Error loading trainers:', err);
        this.error.set('Failed to load trainers. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onSpecialtyChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedSpecialty.set(target.value);
  }

  onExperienceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.minExperience.set(target.value);
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy.set(target.value);
  }

  viewTrainerProfile(trainer: TrainerCard): void {
    console.log('[TrainersComponent] Viewing trainer profile:', trainer.id);
    const isAuthenticated = this.authService.isAuthenticated();
    
    // Route authenticated users to /trainers/:id (with dashboard layout)
    // Route non-authenticated users to /discover/trainers/:id (with landing layout)
    if (isAuthenticated) {
      this.router.navigate(['/trainers', trainer.id], { state: { trainer } });
    } else {
      this.router.navigate(['/discover/trainers', trainer.id], { state: { trainer } });
    }
  }
}
