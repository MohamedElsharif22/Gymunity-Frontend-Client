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
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Back Button -->
        <button
          (click)="goBack()"
          class="mb-6 flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Programs
        </button>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex justify-center items-center min-h-96">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        }

        <!-- Content -->
        @else if (program()) {
          <div class="space-y-6">
            <!-- Program Header -->
            <div class="bg-white rounded-lg shadow p-6">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ program()!.title }}</h1>
              <p class="text-gray-600">{{ program()!.durationWeeks }} weeks • {{ program()!.totalExercises }} exercises</p>
            </div>

            <!-- Weeks List (if no week selected) -->
            @if (!selectedWeek()) {
              <div class="space-y-4">
                <h2 class="text-2xl font-bold text-gray-900">Select a Training Week</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  @for (week of weeks(); track week.id) {
                    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition p-4 space-y-4">
                      <div>
                        <p class="text-sm text-gray-500 font-medium uppercase mb-1">Week</p>
                        <h3 class="text-2xl font-bold text-gray-900">{{ week.weekNumber }}</h3>
                        <p class="text-sm text-gray-600 mt-1">{{ week.title }}</p>
                      </div>
                      <button
                        (click)="selectWeek(week)"
                        class="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition">
                        Load Days →
                      </button>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Days List (if week selected) -->
            @if (selectedWeek()) {
              <div class="space-y-4">
                <button
                  (click)="deselectWeek()"
                  class="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium mb-4">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Back to Weeks
                </button>

                <h2 class="text-2xl font-bold text-gray-900">
                  Week {{ selectedWeek()!.weekNumber }} - Training Days
                </h2>

                @if (days().length > 0) {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    @for (day of days(); track day.id) {
                      <button
                        (click)="selectDay(day)"
                        [disabled]="isLoadingDays()"
                        class="text-left bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-wait">
                        <div class="p-6">
                          <div class="flex items-start justify-between mb-4">
                            <div>
                              <h3 class="text-2xl font-bold text-gray-900">{{ day.title }}</h3>
                              <p class="text-sm text-gray-600">Day {{ day.dayNumber }}</p>
                            </div>
                            <span class="bg-sky-100 text-sky-800 px-4 py-2 rounded-full font-semibold text-sm">
                              Day {{ day.dayNumber }}
                            </span>
                          </div>

                          @if (day.notes) {
                            <p class="text-gray-700 mb-4 p-3 bg-gray-50 rounded border-l-4 border-sky-600 text-sm">
                              {{ day.notes }}
                            </p>
                          }

                          <div class="bg-gray-50 rounded p-4 mb-4">
                            <p class="text-xs text-gray-600 uppercase">Status</p>
                            @if (isLoadingDays()) {
                              <p class="text-sm text-sky-600 font-medium">Loading...</p>
                            } @else {
                              <p class="text-sm text-sky-600 font-medium">Click to view exercises →</p>
                            }
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
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.248 6.253 2 10.541 2 15.5S6.248 24.747 12 24.747s10-4.288 10-9.247S17.752 6.253 12 6.253z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900">Program Not Found</h3>
            <p class="text-gray-500 mt-2">This program could not be loaded</p>
          </div>
        }
      </div>
    </div>
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
    this.router.navigate(['/programs']);
  }
}
