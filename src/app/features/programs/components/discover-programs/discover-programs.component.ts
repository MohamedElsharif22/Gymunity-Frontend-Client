import { Component, inject, signal, ChangeDetectionStrategy, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HomeClientService } from '../../../trainers/services/home-client.service';
import { ProgramService, Program } from '../../services/program.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Discover Programs Component
 * Displays all available programs from the HomeClient service
 * 
 * Responsibility:
 * - Fetch and display all available programs
 * - Navigate to program details on selection
 * - Show loading/error states
 * 
 * Service method: HomeClientService.getAllPrograms()
 */
@Component({
  selector: 'app-discover-programs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Discover Programs</h1>
          <p class="text-lg text-gray-600">Browse all available fitness programs and choose what works for you</p>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 border-4 border-gray-300 border-t-sky-500 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-600 font-medium">Loading programs...</p>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-red-800 font-medium text-lg">{{ error() }}</p>
            <button
              (click)="loadPrograms()"
              class="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
              Try Again
            </button>
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading() && !error() && programs().length === 0) {
          <div class="bg-white rounded-lg shadow p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.248 6.253 2 10.541 2 15.5S6.248 24.747 12 24.747s10-4.288 10-9.247S17.752 6.253 12 6.253z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Programs Available</h3>
            <p class="text-gray-600">Check back later for new training programs</p>
          </div>
        }

        <!-- Programs Grid -->
        @if (!isLoading() && !error() && programs().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (program of programs(); track program.id) {
              <div
                (click)="viewProgram(program.id)"
                class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
                
                <!-- Program Image -->
                <div class="relative h-48 bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center overflow-hidden text-6xl">
                  @if (program.thumbnailUrl) {
                    <img
                      [src]="program.thumbnailUrl"
                      [alt]="program.title || 'Program'"
                      class="w-full h-full object-cover"
                    />
                  } @else {
                    <span>🏋️</span>
                  }
                </div>

                <!-- Content -->
                <div class="p-6">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">{{ program.title || 'Untitled Program' }}</h3>
                  
                  <!-- Description -->
                  @if (program.description) {
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ program.description }}</p>
                  }

                  <!-- Stats -->
                  <div class="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <!-- Type -->
                    @if (program.type) {
                      <div class="text-center">
                        <p class="text-sm font-bold text-gray-900 capitalize">{{ program.type }}</p>
                        <p class="text-xs text-gray-600 mt-1">Program Type</p>
                      </div>
                    }

                    <!-- Duration -->
                    @if (program.durationWeeks) {
                      <div class="text-center">
                        <p class="text-2xl font-bold text-gray-900">{{ program.durationWeeks }}</p>
                        <p class="text-xs text-gray-600 mt-1">Weeks</p>
                      </div>
                    }
                  </div>

                  <!-- Trainer Info -->
                  @if (program.trainerUserName) {
                    <div class="mb-4 flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {{ program.trainerUserName.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-gray-900">{{ program.trainerUserName }}</p>
                          <p class="text-xs text-gray-500">Trainer</p>
                        </div>
                      </div>
                      <button
                        (click)="viewTrainerProfile(program.trainerProfileId); $event.stopPropagation()"
                        class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm font-medium rounded transition-colors">
                        Profile
                      </button>
                    </div>
                  }

                  <!-- CTA Button -->
                  <button
                    (click)="viewProgram(program.id); $event.stopPropagation()"
                    class="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg">
                    View Package
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class DiscoverProgramsComponent implements OnInit {
  private homeClientService = inject(HomeClientService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  programs = signal<Program[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadPrograms();
  }

  loadPrograms() {
    this.isLoading.set(true);
    this.error.set(null);
    this.homeClientService.getAllPrograms().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (programs: any[]) => {
        this.programs.set(programs as Program[]);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading programs:', err);
        this.error.set('Failed to load programs. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  viewProgram(programId: number) {
    const program = this.programs().find(p => p.id === programId);
    if (program && program.trainerProfileId) {
      // Navigate to trainer's packages page using trainer ID
      this.router.navigate(['/packages'], { 
        queryParams: { trainerId: program.trainerProfileId } 
      });
    } else {
      // Fallback to program details if trainer ID not available
      this.router.navigate(['/discover/programs', programId]);
    }
  }

  viewTrainerProfile(trainerProfileId: number) {
    this.router.navigate(['/discover/trainers', trainerProfileId]);
  }
}
