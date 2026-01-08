import { Component, OnInit, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgramService, Program } from '../../services/program.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-my-active-programs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <div class="flex items-center gap-4 mb-4">
            <div class="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl p-3 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-4xl font-bold text-gray-900">My Active Programs</h1>
              <p class="text-gray-600 mt-2">{{ activePrograms().length }} active program(s)</p>
            </div>
          </div>
        </div>

        <!-- Programs Grid -->
        @if (isLoading()) {
          <div class="flex items-center justify-center py-20">
            <div class="animate-spin">
              <svg class="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        } @else if (activePrograms().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (program of activePrograms(); track program.id) {
              <div class="group border-2 border-gray-100 hover:border-indigo-300 rounded-2xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer bg-white" 
                   [routerLink]="['/programs', program.id]">
                <!-- Program Image -->
                @if (program.thumbnailUrl) {
                  <div class="relative h-56 overflow-hidden">
                    <img [src]="program.thumbnailUrl" 
                         [alt]="program.title" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div class="absolute bottom-4 left-4 right-4">
                      <p class="text-white font-bold text-lg truncate">{{ program.title }}</p>
                      <p class="text-white/90 text-sm">by {{ program.trainerUserName || 'Professional Trainer' }}</p>
                    </div>
                  </div>
                } @else {
                  <div class="h-56 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 opacity-10">
                      <div class="absolute inset-0" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px);"></div>
                    </div>
                    <svg class="w-24 h-24 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    <div class="absolute bottom-4 left-4 right-4">
                      <p class="text-white font-bold text-lg truncate">{{ program.title }}</p>
                      <p class="text-white/90 text-sm">by {{ program.trainerUserName || 'Professional Trainer' }}</p>
                    </div>
                  </div>
                }
                
                <!-- Program Content -->
                <div class="p-6">
                  <p class="text-gray-600 mb-6 line-clamp-2 text-sm leading-relaxed">{{ program.description }}</p>
                  
                  <!-- Program Meta -->
                  <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-100">
                      <div class="flex items-center gap-2 text-sky-700 text-sm font-semibold mb-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Duration
                      </div>
                      <p class="font-bold text-gray-900 text-lg">{{ program.durationWeeks }}w</p>
                    </div>
                    <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <div class="flex items-center gap-2 text-purple-700 text-sm font-semibold mb-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                        Type
                      </div>
                      <p class="font-bold text-gray-900 text-lg capitalize truncate">{{ program.type }}</p>
                    </div>
                  </div>

                  <!-- View Button -->
                  <button class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group-hover:scale-105">
                    View Program Details
                    <svg class="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-24">
            <div class="bg-white w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">No Active Programs</h2>
            <p class="text-gray-600 mb-8 max-w-md mx-auto">You don't have any active programs yet. Discover and enroll in programs to get started with your fitness journey.</p>
            <a routerLink="/discover-programs" 
               class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl">
              Browse Programs
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </a>
          </div>
        }
      </div>
    </div>
  `
})
export class MyActiveProgramsComponent implements OnInit {
  private programService = inject(ProgramService);
  private destroyRef = inject(DestroyRef);

  activePrograms = signal<Program[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadActivePrograms();
  }

  private loadActivePrograms() {
    this.programService.getActivePrograms()
      .pipe(
        catchError((err: any) => {
          console.warn('Error loading active programs, falling back to all programs:', err);
          return this.programService.getPrograms();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (programs: Program[]) => {
          this.activePrograms.set(programs);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error('Error loading programs:', err);
          this.isLoading.set(false);
        }
      });
  }
}
