import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgramBrowseService, Program, ProgramWeek } from '../services/program-browse.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-program-detail',
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
            Back to Programs
          </button>

          <div *ngIf="program()" class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 class="text-4xl font-bold text-slate-900 mb-2">{{ program()?.title }}</h1>
            <p class="text-slate-600 mb-4">{{ program()?.description }}</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p class="text-sm text-blue-600 font-semibold">WEEKS</p>
                <p class="text-3xl font-bold text-blue-900">{{ program()?.durationWeeks }}</p>
              </div>
              <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p class="text-sm text-green-600 font-semibold">TOTAL EXERCISES</p>
                <p class="text-3xl font-bold text-green-900">{{ program()?.totalExercises }}</p>
              </div>
              <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p class="text-sm text-purple-600 font-semibold">TRAINER</p>
                <p class="text-lg font-bold text-purple-900">{{ program()?.trainerHandle || 'Unknown' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="text-center py-12">
          <div class="inline-block">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p class="text-slate-600 mt-4">Loading weeks...</p>
          </div>
        </div>

        <!-- Weeks List -->
        <div *ngIf="!isLoading()" class="space-y-4">
          <div
            *ngFor="let week of weeks()"
            (click)="selectWeek(week)"
            class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold text-slate-900">Week {{ week.weekNumber }}</h3>
                <p *ngIf="week.title" class="text-slate-600">{{ week.title }}</p>
                <p *ngIf="week.description" class="text-sm text-slate-500 mt-2">{{ week.description }}</p>
              </div>
              <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProgramDetailComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private programService = inject(ProgramBrowseService);
  private destroy$ = new Subject<void>();

  program = signal<Program | null>(null);
  weeks = signal<ProgramWeek[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const programId = params.get('id');
        if (programId) {
          this.loadProgramAndWeeks(parseInt(programId, 10));
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProgramAndWeeks(programId: number) {
    this.isLoading.set(true);
    // Note: You may need to add a getProgramById endpoint to your service
    // For now, we'll just load the weeks
    this.programService.getProgramWeeks(programId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (weeks) => {
          this.weeks.set(weeks);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading weeks:', err);
          this.isLoading.set(false);
        }
      });
  }

  selectWeek(week: ProgramWeek) {
    this.router.navigate(['/programs/week', week.id]);
  }

  goBack() {
    this.router.navigate(['/programs/browse']);
  }
}
