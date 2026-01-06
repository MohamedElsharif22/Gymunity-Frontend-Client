import { Component, inject, signal, ChangeDetectionStrategy, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgramService, Program } from '../../services/program.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Programs List Component
 * Displays all active programs available to the authenticated user
 * Matches the dashboard's active programs section
 * 
 * Responsibility:
 * - Fetch and display active programs
 * - Navigate to program details on selection
 * - Show loading/error states
 * 
 * Service method: ProgramService.getPrograms()
 */
@Component({
  selector: 'app-programs-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900">My Active Programs</h1>
          <p class="text-gray-600 mt-2">Your personalized training programs</p>
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <div class="bg-white rounded-lg shadow p-8">
            <div class="flex items-center justify-center space-x-3">
              <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
              <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
              <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
              <span class="text-gray-600 ml-4">Loading programs...</span>
            </div>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {{ error() }}
          </div>
        }

        <!-- Programs Grid -->
        @if (!loading() && programs().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (program of programs(); track program.id) {
              <div class="group border-2 border-gray-100 hover:border-indigo-300 rounded-xl overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer bg-white" 
                   [routerLink]="['/programs', program.id]">
                <!-- Program Image -->
                @if (program.thumbnailUrl) {
                  <div class="relative h-48 overflow-hidden">
                    <img [src]="program.thumbnailUrl" 
                         [alt]="program.title" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div class="absolute bottom-3 left-3 right-3">
                      <p class="text-white font-bold text-lg truncate">{{ program.title }}</p>
                      <p class="text-white/90 text-sm">{{ program.trainerUserName || 'Professional Trainer' }}</p>
                    </div>
                  </div>
                } @else {
                  <div class="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 opacity-10">
                      <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                    </div>
                    <div class="absolute bottom-3 left-3 right-3">
                      <p class="text-white font-bold text-lg truncate">{{ program.title }}</p>
                      <p class="text-white/90 text-sm">{{ program.trainerUserName || 'Professional Trainer' }}</p>
                    </div>
                  </div>
                }
                
                <!-- Program Content -->
                <div class="p-5">
                  <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ program.description }}</p>
                  
                  <!-- Program Meta -->
                  <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="bg-gray-50 rounded-lg p-3">
                      <div class="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Duration
                      </div>
                      <p class="font-bold text-gray-900">{{ program.durationWeeks }}w</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                      <div class="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m6 2a8 8 0 11-16 0 8 8 0 0116 0zm-5-2v4m0 0v4m0-4h4m0 0h4"></path>
                        </svg>
                        Type
                      </div>
                      <p class="font-bold text-gray-900 capitalize truncate">{{ program.type }}</p>
                    </div>
                  </div>

                  <!-- View Button -->
                  <button class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg">
                    View Program
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (!loading() && programs().length === 0) {
          <div class="bg-white rounded-lg shadow p-12 text-center">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <h3 class="text-lg font-bold text-gray-900 mb-2">No Active Programs Yet</h3>
            <p class="text-gray-600 mb-6">You don't have any active programs. Browse available programs to get started.</p>
            <a routerLink="/discover-programs" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md">
              Browse Programs
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .line-clamp-2 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    `
  ]
})
export class ProgramsListComponent implements OnInit {
  private programsService = inject(ProgramService);
  private destroyRef = inject(DestroyRef);

  programs = signal<Program[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadPrograms();
  }

  private loadPrograms() {
    this.loading.set(true);
    this.error.set(null);

    this.programsService
      .getPrograms()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (programs: Program[]) => {
          console.log('[ProgramsListComponent] Programs loaded:', programs);
          this.programs.set(programs);
          this.loading.set(false);
        },
        error: (err: any) => {
          this.loading.set(false);
          const errorMessage = err instanceof Error ? err.message : 'Failed to load programs.';
          this.error.set(errorMessage);
          console.error('[ProgramsListComponent] Error loading programs:', err);
        }
      });
  }
}
