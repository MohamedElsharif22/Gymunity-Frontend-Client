import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HomeClientService } from '../../trainers/services/home-client.service';
import { Program } from '../../../core/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Training Programs</h1>
          <p class="text-gray-600">Select a program to view workout structure and exercises</p>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex justify-center items-center min-h-96">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        }

        <!-- Programs Grid -->
        @else if (programs().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (program of programs(); track program.id) {
              <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                   (click)="viewProgram(program.id)">
                <!-- Thumbnail -->
                <div class="relative h-48 bg-gray-200 overflow-hidden">
                  <img [src]="program.thumbnailUrl"
                       [alt]="program.title"
                       class="w-full h-full object-cover hover:scale-105 transition">
                  <div class="absolute top-4 right-4">
                    <span class="bg-sky-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {{ program.durationWeeks }}w
                    </span>
                  </div>
                </div>

                <!-- Content -->
                <div class="p-6">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">{{ program.title }}</h3>
                  <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ program.description }}</p>

                  <!-- Stats -->
                  <div class="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p class="text-xs text-gray-600 uppercase">Type</p>
                      <p class="font-semibold text-gray-900">{{ program.type }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-600 uppercase">Duration</p>
                      <p class="font-semibold text-gray-900">{{ program.durationWeeks }} weeks</p>
                    </div>
                  </div>

                  <!-- Trainer Info -->
                  @if (program.trainerName) {
                    <div class="mb-4 pb-4 border-b border-gray-200">
                      <p class="text-xs text-gray-600 uppercase">Trainer</p>
                      <p class="font-semibold text-gray-900">{{ program.trainerName || 'Unknown' }}</p>
                    </div>
                  }

                  <!-- Price -->
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs text-gray-600 uppercase">Price</p>
                      @if (program.price && program.price > 0) {
                        <p class="text-2xl font-bold text-sky-600"><span>$</span>{{ program.price | number: '1.2-2' }}</p>
                      } @else {
                        <p class="text-2xl font-bold text-gray-400">Subscription</p>
                      }
                    </div>
                    <button class="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @else if (!isLoading() && programs().length === 0) {
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.248 6.253 2 10.541 2 15.5S6.248 24.747 12 24.747s10-4.288 10-9.247S17.752 6.253 12 6.253z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900">No Programs Available</h3>
            <p class="text-gray-500 mt-2">Check back later for new training programs</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class ProgramsComponent implements OnInit {
  private homeClientService = inject(HomeClientService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  programs = signal<Program[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadPrograms();
  }

  private loadPrograms() {
    this.isLoading.set(true);
    this.homeClientService.getAllPrograms().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (programs: Program[]) => {
        this.programs.set(programs);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading programs:', err);
        this.isLoading.set(false);
      }
    });
  }

  viewProgram(programId: number) {
    this.router.navigate(['/programs', programId]);
  }
}
