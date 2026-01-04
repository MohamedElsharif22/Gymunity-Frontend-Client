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
import { RouterLink } from '@angular/router';
import { TrainerDiscoveryService } from '../services/trainer-discovery.service';
import { HomeClientService } from '../services/home-client.service';
import { TrainerCard, TrainerSearchOptions, TrainerClient } from '../../../core/models';

@Component({
  selector: 'app-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 p-6 md:p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Find Trainers</h1>
        <p class="text-gray-600">Discover and connect with professional fitness trainers</p>
      </div>

      <!-- Search and Filter Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search Input -->
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
              Search Trainers
            </label>
            <input
              id="search"
              type="text"
              [value]="searchTerm()"
              (input)="onSearchChange($event)"
              placeholder="Name, specialty, or handle..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Specialty Filter -->
          <div>
            <label for="specialty" class="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <select
              id="specialty"
              [value]="selectedSpecialty()"
              (change)="onSpecialtyChange($event)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Specializations</option>
              @for (specialty of availableSpecialties(); track specialty) {
                <option [value]="specialty">{{ specialty }}</option>
              }
            </select>
          </div>

          <!-- Experience Filter -->
          <div>
            <label for="experience" class="block text-sm font-medium text-gray-700 mb-2">
              Min. Experience
            </label>
            <select
              id="experience"
              [value]="minExperience()"
              (change)="onExperienceChange($event)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label for="sortBy" class="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sortBy"
              [value]="sortBy()"
              (change)="onSortChange($event)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div class="mb-4 text-sm text-gray-600">
        @if (totalCount() > 0) {
          <p>
            Showing {{ filteredTrainers().length }} of {{ totalCount() }} trainers
            @if (searchTerm()) {
              matching "{{ searchTerm() }}"
            }
          </p>
        }
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center py-16">
          <div
            class="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"
          ></div>
          <p class="mt-4 text-gray-600">Loading trainers...</p>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p class="text-red-800 font-medium">{{ error() }}</p>
          <button
            (click)="loadTrainers()"
            class="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && !error() && filteredTrainers().length === 0) {
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg
            class="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 00-20 0v2h2v-2z"
            />
          </svg>
          <p class="text-gray-600 text-lg">No trainers found</p>
          <p class="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      }

      <!-- Trainers Grid -->
      @if (!isLoading() && !error() && filteredTrainers().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (trainer of filteredTrainers(); track trainer.id) {
            <div
              class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <!-- Cover Image -->
              @if (trainer.coverImageUrl) {
                <div class="h-32 bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden">
                  <img
                    [src]="trainer.coverImageUrl"
                    [alt]="trainer.fullName"
                    class="w-full h-full object-cover"
                  />
                </div>
              } @else {
                <div class="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
              }

              <div class="p-6">
                <!-- Profile Section -->
                <div class="flex items-start gap-4 mb-4">
                  <!-- Profile Photo -->
                  <div class="flex-shrink-0">
                    @if (trainer.profilePhotoUrl) {
                      <img
                        [src]="trainer.profilePhotoUrl"
                        [alt]="trainer.fullName"
                        class="w-16 h-16 rounded-full object-cover border-2 border-white -mt-12 relative z-10"
                      />
                    } @else {
                      <div
                        class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white -mt-12 relative z-10"
                      >
                        {{ trainer?.fullName?.charAt(0)?.toUpperCase() ?? 'T' }}
                      </div>
                    }
                  </div>

                  <!-- Basic Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="text-lg font-bold text-gray-900">{{ trainer.fullName }}</h3>
                      @if (trainer.isVerified) {
                        <svg
                          class="w-5 h-5 text-blue-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      }
                    </div>
                    <p class="text-sm text-gray-600 truncate">@{{ trainer.handle }}</p>
                  </div>
                </div>

                <!-- Bio -->
                @if (trainer.bio) {
                  <p class="text-sm text-gray-700 mb-4 line-clamp-2">{{ trainer.bio }}</p>
                }

                <!-- Stats -->
                <div class="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200">
                  <!-- Experience -->
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">{{ trainer.yearsExperience }}</p>
                    <p class="text-xs text-gray-600">Years Exp.</p>
                  </div>

                  <!-- Rating -->
                  <div class="text-center">
                    <div class="flex items-center justify-center mb-1">
                      <span class="text-2xl font-bold text-gray-900">{{
                        trainer.ratingAverage.toFixed(1)
                      }}</span>
                      <svg class="w-5 h-5 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                    </div>
                    <p class="text-xs text-gray-600">({{ trainer.totalReviews }} reviews)</p>
                  </div>
                </div>

                <!-- Specializations -->
                @if (trainer.specializations && trainer.specializations.length > 0) {
                  <div class="mb-4">
                    <p class="text-xs font-semibold text-gray-700 mb-2">Specializations</p>
                    <div class="flex flex-wrap gap-2">
                      @for (spec of trainer.specializations.slice(0, 3); track spec) {
                        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {{ spec }}
                        </span>
                      }
                      @if (trainer.specializations.length > 3) {
                        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{{ trainer.specializations.length - 3 }}
                        </span>
                      }
                    </div>
                  </div>
                }

                <!-- Price -->
                <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-700">
                    Starting from <span class="font-bold text-gray-900"
                      >{{ trainer.currency }} {{ trainer.startingPrice }}</span
                    >
                  </p>
                </div>

                <!-- Stats Row -->
                <div class="flex items-center justify-between text-xs text-gray-600 mb-4 pb-4 border-b border-gray-200">
                  <span>{{ trainer.totalClients }} clients</span>
                  @if (trainer.hasActiveSubscription) {
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium"
                      >Available</span
                    >
                  } @else {
                    <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">Not Available</span>
                  }
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-2">
                  <button
                    [routerLink]="['/trainers', trainer.id]"
                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    View Profile
                  </button>
                  <button
                    (click)="contactTrainer(trainer)"
                    class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: []
})
export class TrainersComponent implements OnInit {
  private readonly trainerDiscoveryService = inject(TrainerDiscoveryService);
  private readonly homeClientService = inject(HomeClientService);

  // State signals
  trainers = signal<TrainerCard[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  searchTerm = signal('');
  selectedSpecialty = signal('');
  minExperience = signal('');
  sortBy = signal('');
  totalCount = signal(0);
  useHomeClientSearch = signal(false); // Toggle between TrainerDiscovery and HomeClient APIs

  // Computed signals
  availableSpecialties = computed(() => {
    const specialties = new Set<string>();
    this.trainers().forEach(trainer => {
      if (trainer?.specializations && Array.isArray(trainer.specializations)) {
        trainer.specializations.forEach((spec: string) => specialties.add(spec));
      }
    });
    return Array.from(specialties).sort();
  });

  filteredTrainers = computed(() => {
    let filtered = this.trainers();
    const search = this.searchTerm().toLowerCase();
    const specialty = this.selectedSpecialty();
    const minExp = this.minExperience() ? parseInt(this.minExperience()) : null;

    // Filter by search term
    if (search) {
      filtered = filtered.filter(
        trainer =>
          trainer.fullName.toLowerCase().includes(search) ||
          trainer.handle.toLowerCase().includes(search) ||
          trainer.bio?.toLowerCase().includes(search)
      );
    }

    // Filter by specialization
    if (specialty) {
      filtered = filtered.filter(trainer => trainer.specializations.includes(specialty));
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
      filtered.sort((a, b) => a.startingPrice - b.startingPrice);
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Use HomeClient service if toggle is on and search term exists
    if (this.useHomeClientSearch() && this.searchTerm()) {
      this.homeClientService.search(this.searchTerm()).subscribe({
        next: response => {
          // Convert TrainerClient[] to TrainerCard[]
          const trainers: TrainerCard[] = (response?.trainers || []).map(t => this.convertToTrainerCard(t));
          this.trainers.set(trainers);
          this.totalCount.set(trainers.length);
          this.isLoading.set(false);
          console.log('[TrainersComponent] Loaded trainers from HomeClient:', trainers);
        },
        error: err => {
          console.error('[TrainersComponent] Error loading trainers from HomeClient:', err);
          this.error.set('Failed to load trainers. Please try again.');
          this.isLoading.set(false);
        }
      });
    } else if (this.useHomeClientSearch()) {
      // Load all trainers from HomeClient if no search term
      this.homeClientService.getAllTrainers().subscribe({
        next: response => {
          // Convert TrainerClient[] to TrainerCard[]
          const trainers: TrainerCard[] = (response || []).map(t => this.convertToTrainerCard(t));
          this.trainers.set(trainers);
          this.totalCount.set(trainers.length);
          this.isLoading.set(false);
          console.log('[TrainersComponent] Loaded all trainers from HomeClient:', trainers);
        },
        error: err => {
          console.error('[TrainersComponent] Error loading trainers from HomeClient:', err);
          this.error.set('Failed to load trainers. Please try again.');
          this.isLoading.set(false);
        }
      });
    } else {
      // Use original TrainerDiscoveryService
      this.trainerDiscoveryService.searchTrainers().subscribe({
        next: response => {
          const trainers = response?.data || [];
          this.trainers.set(trainers);
          this.totalCount.set(response?.count || 0);
          this.isLoading.set(false);
          console.log('[TrainersComponent] Loaded trainers from TrainerDiscovery:', trainers);
        },
        error: err => {
          console.error('[TrainersComponent] Error loading trainers from TrainerDiscovery:', err);
          this.error.set('Failed to load trainers. Please try again.');
          this.isLoading.set(false);
        }
      });
    }
  }

  private convertToTrainerCard(client: TrainerClient): TrainerCard {
    return {
      id: String(client.id),
      fullName: client.userName,
      handle: client.handle,
      profilePhotoUrl: null, // Not available in HomeClient API
      coverImageUrl: client.coverImageUrl || null,
      bio: client.bio,
      isVerified: false, // Not available in HomeClient API
      ratingAverage: client.ratingAverage,
      totalReviews: 0, // Not available in HomeClient API
      totalClients: client.totalClients,
      yearsExperience: 0, // Not available in HomeClient API
      specializations: [], // Not available in HomeClient API
      startingPrice: 0, // Not available in HomeClient API
      currency: 'USD', // Default currency
      hasActiveSubscription: false, // Not available in HomeClient API
    };
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    // Auto-load results when using HomeClient search
    if (this.useHomeClientSearch()) {
      this.loadTrainers();
    }
  }

  toggleSearchSource(): void {
    this.useHomeClientSearch.update(v => !v);
    this.loadTrainers();
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

  contactTrainer(trainer: TrainerCard): void {
    console.log('[TrainersComponent] Contacting trainer:', trainer);
    // TODO: Implement contact trainer functionality (chat, email, etc.)
    alert(`Contact trainer: ${trainer.fullName}`);
  }
}
