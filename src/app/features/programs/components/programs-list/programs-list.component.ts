import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ClientProgramsService } from '../../services/client-programs.service';
import { ProgramResponse } from '../../../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Programs List Component
 * Displays all active programs available to the authenticated user
 * 
 * Responsibility:
 * - Fetch and display list of programs
 * - Navigate to program details on selection
 * - Show loading/error states
 * 
 * Service method: ClientProgramsService.getActivePrograms()
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
          <h1 class="text-4xl font-bold text-gray-900">My Programs</h1>
          <p class="text-gray-600 mt-2">Your personalized training programs</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="bg-white rounded-lg shadow p-8">
          <div class="flex items-center justify-center space-x-3">
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
            <span class="text-gray-600 ml-4">Loading programs...</span>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error() }}
        </div>

        <!-- Programs Grid -->
        <div *ngIf="!loading() && programs().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            *ngFor="let program of programs()"
            [routerLink]="['/programs', program.id]"
            class="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-shadow"
          >
            <img
              *ngIf="program.thumbnailUrl"
              [src]="program.thumbnailUrl"
              [alt]="program.title"
              class="w-full h-48 object-cover rounded-t-lg"
            />
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900">{{ program.title }}</h3>
              <p class="text-gray-600 text-sm mt-2 line-clamp-2">{{ program.description }}</p>
              
              <div class="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <span class="text-gray-500">Duration</span>
                  <p class="font-semibold text-gray-900">{{ program.durationWeeks }} weeks</p>
                </div>
                <div>
                  <span class="text-gray-500">Exercises</span>
                  <p class="font-semibold text-gray-900">{{ program.totalExercises }}</p>
                </div>
              </div>

              <div class="mt-4 pt-4 border-t border-gray-200">
                <p class="text-sm text-gray-600">
                  by <span class="font-semibold">{{ program.trainerUserName }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && programs().length === 0" class="bg-white rounded-lg shadow p-12 text-center">
          <p class="text-gray-600">No programs available yet.</p>
          <p class="text-gray-500 text-sm mt-2">Check back later or contact your trainer.</p>
        </div>
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
export class ProgramsListComponent implements OnInit, OnDestroy {
  private programsService = inject(ClientProgramsService);
  private destroy$ = new Subject<void>();

  programs = signal<ProgramResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadPrograms();
  }

  private loadPrograms() {
    this.loading.set(true);
    this.error.set(null);

    this.programsService
      .getActivePrograms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (programs) => {
          this.programs.set(programs);
          this.loading.set(false);
          console.log('[ProgramsListComponent] Programs loaded:', programs);
        },
        error: (err) => {
          this.loading.set(false);
          const errorMessage = err.error?.message || err.error?.errors?.[0] || 'Failed to load programs.';
          this.error.set(errorMessage);
          console.error('[ProgramsListComponent] Error loading programs:', err);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
