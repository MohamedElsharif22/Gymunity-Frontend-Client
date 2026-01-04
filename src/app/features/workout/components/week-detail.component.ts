import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgramBrowseService, ProgramDay } from '../services/program-browse.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-week-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <button
            (click)="goBack()"
            class="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Program
          </button>

          <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 class="text-4xl font-bold text-slate-900 mb-2">Week {{ weekNumber() }}</h1>
            <p class="text-slate-600">Select a day to view exercises</p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="text-center py-12">
          <div class="inline-block">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p class="text-slate-600 mt-4">Loading days...</p>
          </div>
        </div>

        <!-- Days Grid -->
        <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            *ngFor="let day of days()"
            (click)="selectDay(day)"
            class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-l-4 border-green-500">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-slate-900">Day {{ day.dayNumber }}: {{ day.title }}</h3>
                <p class="text-slate-600 mt-2">{{ day.notes }}</p>
              </div>
              <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-50 p-3 rounded">
                <p class="text-xs text-slate-600 font-semibold">EXERCISES</p>
                <p class="text-lg font-bold text-slate-900">{{ day.exercises?.length || 0 }}</p>
              </div>
              <div class="bg-slate-50 p-3 rounded">
                <p class="text-xs text-slate-600 font-semibold">TOTAL SETS</p>
                <p class="text-lg font-bold text-slate-900">{{ calculateTotalSets(day) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- No Days -->
        <div *ngIf="!isLoading() && days().length === 0" class="bg-white rounded-lg shadow-lg p-8 text-center">
          <p class="text-slate-600">No days available for this week</p>
        </div>
      </div>
    </div>
  `
})
export class WeekDetailComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private programService = inject(ProgramBrowseService);
  private destroy$ = new Subject<void>();

  days = signal<ProgramDay[]>([]);
  isLoading = signal(true);
  weekNumber = signal(0);

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const weekId = params.get('id');
        if (weekId) {
          this.loadWeekDays(parseInt(weekId, 10));
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWeekDays(weekId: number) {
    this.isLoading.set(true);
    this.programService.getProgramDays(weekId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (days) => {
          this.days.set(days);
          if (days.length > 0) {
            // Extract week number from the first day
            const firstDay = days[0];
            // You might need to calculate or extract week number differently
            this.weekNumber.set(1);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading days:', err);
          this.isLoading.set(false);
        }
      });
  }

  selectDay(day: ProgramDay) {
    // Navigate to day exercises, passing day ID to fetch exercises
    this.router.navigate(['/programs/day', day.id]);
  }

  calculateTotalSets(day: ProgramDay): number {
    if (!day.exercises) return 0;
    return day.exercises.reduce((total, exercise) => {
      return total + parseInt(exercise.sets || '0', 10);
    }, 0);
  }

  goBack() {
    this.router.navigate(['/programs/browse']);
  }
}
