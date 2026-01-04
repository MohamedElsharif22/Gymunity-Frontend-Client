import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProgramService } from '../../programs/services/program.service';
import { WorkoutSessionService } from '../services/workout-session.service';

interface WorkoutOption {
  programId: number;
  programName: string;
  dayId: number;
  dayNumber: number;
  dayTitle: string;
  dayNotes?: string;
  exercisesCount: number;
  estimatedDuration: number;
}

@Component({
  selector: 'app-workout-start',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <!-- Header -->
      <header class="fixed top-0 left-0 right-0 bg-slate-800/80 backdrop-blur-md border-b border-white/10 z-40">
        <div class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div class="flex items-center gap-3">
            <button (click)="goBack()" class="p-2 hover:bg-white/10 rounded-lg transition">
              <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
              Start Your Workout
            </h1>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="pt-24 pb-8">
        <div class="max-w-7xl mx-auto px-6">
          @if (isLoading()) {
            <div class="flex items-center justify-center min-h-96">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
            </div>
          } @else if (availableWorkouts().length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (workout of availableWorkouts(); track workout.dayId) {
                <div
                  (click)="startWorkout(workout)"
                  class="group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:border-sky-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/20 cursor-pointer animate-slideDown"
                  [style.animation-delay]="'0s'">
                  <!-- Gradient Background -->
                  <div class="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-emerald-500/0 group-hover:from-sky-500/10 group-hover:to-emerald-500/10 transition-all duration-300"></div>

                  <div class="relative z-10">
                    <!-- Header -->
                    <div class="mb-4">
                      <p class="text-xs text-slate-400 uppercase tracking-wide">{{ workout.programName }}</p>
                      <h3 class="text-xl font-bold text-white mt-1">{{ workout.dayTitle }}</h3>
                      <p class="text-sm text-slate-400 mt-1">Day {{ workout.dayNumber }}</p>
                    </div>

                    @if (workout.dayNotes) {
                      <p class="text-sm text-slate-300 mb-4 line-clamp-2">{{ workout.dayNotes }}</p>
                    }

                    <!-- Stats -->
                    <div class="grid grid-cols-2 gap-3 mb-6">
                      <div class="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p class="text-xs text-slate-400 uppercase tracking-wide">Exercises</p>
                        <p class="text-2xl font-bold text-sky-400 mt-1">{{ workout.exercisesCount }}</p>
                      </div>
                      <div class="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p class="text-xs text-slate-400 uppercase tracking-wide">Duration</p>
                        <p class="text-2xl font-bold text-emerald-400 mt-1">{{ workout.estimatedDuration }}m</p>
                      </div>
                    </div>

                    <!-- Button -->
                    <button
                      class="w-full relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 p-1 transition-all duration-300 group/btn">
                      <div class="relative bg-slate-900 rounded-[6px] px-4 py-3 flex items-center justify-center gap-2 group-hover/btn:bg-opacity-80 transition-all font-semibold text-white text-sm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        Start Workout
                      </div>
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="flex flex-col items-center justify-center min-h-96 text-center">
              <svg class="w-20 h-20 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h2 class="text-2xl font-bold text-white mb-2">No Program Selected</h2>
              <p class="text-slate-400 mb-6">Select a program from your subscription to start a workout</p>
              <button
                (click)="navigateTo('/programs')"
                class="relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 p-1 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50">
                <div class="relative bg-slate-900 rounded-[6px] px-6 py-3 flex items-center justify-center gap-2 font-semibold text-white">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Browse Programs
                </div>
              </button>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host ::ng-deep {
      .animate-slideDown {
        animation: slideDown 0.5s ease-out forwards;
        opacity: 0;
      }
    }
  `]
})
export class WorkoutStartComponent implements OnInit {
  private programService = inject(ProgramService);
  private sessionService = inject(WorkoutSessionService);
  private router = inject(Router);

  isLoading = signal(false);
  availableWorkouts = signal<WorkoutOption[]>([]);

  ngOnInit() {
    this.loadAvailableWorkouts();
  }

  loadAvailableWorkouts() {
    this.isLoading.set(true);

    // Get user's active program/subscription
    this.programService.getActiveProgram().subscribe({
      next: (program: any) => {
        if (!program || !program.programWeeks) {
          this.isLoading.set(false);
          return;
        }

        const workouts: WorkoutOption[] = [];

        // Flatten all days from all weeks
        program.programWeeks.forEach((week: any) => {
          week.days?.forEach((day: any) => {
            if (day.exercises && day.exercises.length > 0) {
              const estimatedDuration = day.exercises.reduce((sum: number, ex: any) => {
                const reps = ex.reps || 0;
                const sets = ex.sets || 1;
                const timePerRep = 2; // Assume 2 seconds per rep
                return sum + (reps * sets * timePerRep / 60);
              }, 0);

              workouts.push({
                programId: program.programId || program.id,
                programName: program.programName || 'My Program',
                dayId: day.programDayId || day.id,
                dayNumber: day.dayNumber || day.orderIndex || 1,
                dayTitle: day.title || day.dayName || `Day ${day.dayNumber}`,
                dayNotes: day.notes || day.description,
                exercisesCount: day.exercises.length,
                estimatedDuration: Math.ceil(estimatedDuration) || 30
              });
            }
          });
        });

        this.availableWorkouts.set(workouts);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  startWorkout(workout: WorkoutOption) {
    // Load the day details and start the session
    this.programService.getProgramDay(workout.programId, workout.dayId).subscribe({
      next: (dayDetails: any) => {
        // Initialize the session with real data
        this.sessionService.startDay(
          workout.dayId,
          workout.dayTitle,
          workout.dayNotes || '',
          dayDetails.exercises || []
        );

        // Navigate to the workout day page
        this.router.navigate(['/workout/day']);
      },
      error: (error) => {
        console.error('Error loading workout day:', error);
        alert('Failed to start workout. Please try again.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
