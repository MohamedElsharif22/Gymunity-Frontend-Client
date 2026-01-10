import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgramService, Program, ProgramWeek, ProgramDay } from '../../services/program.service';
import { HomeClientService } from '../../../trainers/services/home-client.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-3 sm:px-4 md:px-8">
      <div class="max-w-6xl mx-auto">
        <!-- Back Button & Header -->
        <div class="mb-8">
          <button
            (click)="goBack()"
            class="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold mb-6 group transition-all duration-200 active:scale-95"
          >
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Programs
          </button>
          <div>
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {{ program()?.title }}
            </h1>
            <p class="text-gray-600 text-sm sm:text-base md:text-lg">{{ program()?.durationWeeks }} weeks • {{ program()?.totalExercises }} exercises</p>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex items-center justify-center py-20">
            <div class="relative">
              <div class="w-20 h-20 border-4 border-sky-200 rounded-full"></div>
              <div class="w-20 h-20 border-4 border-sky-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        }

        <!-- Content -->
        @else if (program()) {
          <div class="space-y-8">
            <!-- Weeks List (if no week selected) -->
            @if (!selectedWeek()) {
              <div>
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Select a Training Week</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  @for (week of weeks(); track week.id) {
                    <button
                      (click)="selectWeek(week)"
                      class="text-left bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden group hover:scale-105 active:scale-95"
                    >
                      <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-100 to-indigo-100 rounded-full -mr-8 -mt-8 opacity-50"></div>
                      <div class="relative z-10 space-y-4">
                        <div>
                          <p class="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Week</p>
                          <h3 class="text-4xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">{{ week.weekNumber }}</h3>
                        </div>
                        <div>
                          <h4 class="text-lg font-bold text-gray-900 line-clamp-2">{{ week.title }}</h4>
                        </div>
                        <div class="flex items-center gap-2 pt-2">
                          <span class="text-sm font-semibold text-sky-600 group-hover:text-sky-700">Load Days</span>
                          <svg class="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </div>
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Days List (if week selected) -->
            @if (selectedWeek()) {
              <div>
                <button
                  (click)="deselectWeek()"
                  class="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold mb-6 group transition-all duration-200 active:scale-95"
                >
                  <svg class="w-5 h-5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Back to Weeks
                </button>

                <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  Week {{ selectedWeek()!.weekNumber }} - Training Days
                </h2>

                @if (days().length > 0) {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    @for (day of days(); track day.id) {
                      <button
                        (click)="selectDay(day)"
                        [disabled]="isLoadingDays()"
                        class="text-left bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 overflow-hidden group hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100"
                      >
                        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
                        
                        <div class="relative z-10 space-y-5">
                          <!-- Header -->
                          <div class="flex items-start justify-between">
                            <div class="flex-1">
                              <span class="inline-block text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full mb-3">
                                Day {{ day.dayNumber }}
                              </span>
                              <h3 class="text-2xl font-bold text-gray-900 leading-tight line-clamp-2">{{ day.title }}</h3>
                            </div>
                          </div>

                          <!-- Notes -->
                          @if (day.notes) {
                            <p class="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-200 italic">
                              {{ day.notes }}
                            </p>
                          }

                          <!-- Status -->
                          <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 flex items-center justify-between">
                            <div>
                              <p class="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Action</p>
                              @if (isLoadingDays()) {
                                <p class="text-sm text-sky-600 font-semibold">Loading...</p>
                              } @else {
                                <p class="text-sm text-sky-600 font-semibold flex items-center gap-2">
                                  View Exercises
                                  <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                  </svg>
                                </p>
                              }
                            </div>
                          </div>
                        </div>
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Not Found State -->
        @else if (!isLoading()) {
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.248 6.253 2 10.541 2 15.5S6.248 24.747 12 24.747s10-4.288 10-9.247S17.752 6.253 12 6.253z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Program Not Found</h3>
            <p class="text-gray-600 mb-6">This program could not be loaded</p>
            <button
              (click)="goBack()"
              class="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Go Back
            </button>
          </div>
        }
      </div>
    </div>

    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease;
      }

      .animate-slideUp {
        animation: slideUp 0.4s ease;
      }
    </style>
  `,
  styles: []
})
export class ProgramDetailComponent implements OnInit {
  private programService = inject(ProgramService);
  private homeClientService = inject(HomeClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // State
  program = signal<Program | null>(null);
  weeks = signal<ProgramWeek[]>([]);
  days = signal<ProgramDay[]>([]);
  selectedWeek = signal<ProgramWeek | null>(null);
  selectedDay = signal<ProgramDay | null>(null);

  // Loading states
  isLoading = signal(false);
  isLoadingDays = signal(false);

  ngOnInit() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const programId = parseInt(params['id'], 10);
        console.log('Loading program with ID:', programId);
        this.loadProgram(programId);
      });
  }

  private loadProgram(programId: number) {
    this.isLoading.set(true);
    
    // Check if accessing via discover route (guest) or authenticated route
    const useGuestService = this.router.url.includes('/discover/');

    // Use HomeClientService for guest routes, ProgramService for authenticated routes
    const programObservable = useGuestService
      ? (this.homeClientService.getProgramById(programId) as any)
      : (this.programService.getProgramById(programId) as any);

    programObservable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (prog: any) => {
          console.log('Program loaded:', prog);
          this.program.set(prog as Program);

          // Use weeks from program data if available
          if (prog.weeks && prog.weeks.length > 0) {
            console.log('Program weeks loaded from program data:', prog.weeks);
            this.weeks.set(prog.weeks);
          } else if (!useGuestService) {
            // Only load weeks via API if authenticated and not from program data
            this.programService.getProgramWeeks(prog.id)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (weeks) => {
                  console.log('Program weeks loaded from backend:', weeks);
                  this.weeks.set(weeks);
                },
                error: (err) => {
                  console.error('Error loading program weeks:', err);
                  this.weeks.set([]);
                }
              });
          }

          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Error loading program:', err);
          this.isLoading.set(false);
        }
      });
  }

  // Weeks and days are provided by backend; frontend generation removed.

  selectWeek(week: ProgramWeek) {
    console.log('Week selected:', week.weekNumber);
    this.selectedWeek.set(week);
    this.selectedDay.set(null);

    // Load days for the selected week from backend
    this.isLoadingDays.set(true);
    this.programService.getProgramDaysByWeek(week.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (backendDays) => {
          console.log('Program days loaded from backend for week:', week.weekNumber, backendDays);
          // Backend-provided days include real DB ids (ProgramDayId)
          this.days.set(backendDays);
          this.isLoadingDays.set(false);
        },
        error: (err) => {
          console.error('Error loading days for week:', err);
          this.days.set([]);
          this.isLoadingDays.set(false);
        }
      });
  }

  deselectWeek() {
    this.selectedWeek.set(null);
    this.days.set([]);
  }

  selectDay(day: ProgramDay) {
    this.selectedDay.set(day);
    // Navigate to program day detail route
    this.router.navigate([`/programs/${this.program()?.id}/days/${day.id}`]);
  }

  // No local generation of days — days come from backend and include real IDs.

  goBack() {
    // Navigate back to my-active-programs since that's where the user came from
    this.router.navigate(['/my-active-programs']);
  }
}
