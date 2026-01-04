import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProgramBrowseService, Program } from '../services/program-browse.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-browse-programs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <button
            (click)="goBack()"
            class="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>

          <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 class="text-4xl font-bold text-slate-900 mb-2">Browse Programs</h1>
            <p class="text-slate-600">Select a program to explore its structure and exercises</p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="text-center py-12">
          <div class="inline-block">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p class="text-slate-600 mt-4">Loading programs...</p>
          </div>
        </div>

        <!-- Programs Grid -->
        <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            *ngFor="let program of programs()"
            (click)="selectProgram(program)"
            class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer transform hover:scale-105">
            <!-- Program Image -->
            <div *ngIf="program.thumbnailUrl" class="h-40 overflow-hidden bg-slate-200">
              <img
                [src]="program.thumbnailUrl"
                [alt]="program.title"
                class="w-full h-full object-cover">
            </div>

            <!-- Program Info -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-slate-900 mb-2">{{ program.title }}</h3>
              <p class="text-slate-600 text-sm mb-4">{{ program.description }}</p>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-blue-50 p-3 rounded">
                  <p class="text-xs text-blue-600 font-semibold">WEEKS</p>
                  <p class="text-lg font-bold text-blue-900">{{ program.durationWeeks }}</p>
                </div>
                <div class="bg-green-50 p-3 rounded">
                  <p class="text-xs text-green-600 font-semibold">EXERCISES</p>
                  <p class="text-lg font-bold text-green-900">{{ program.totalExercises }}</p>
                </div>
              </div>

              <button
                (click)="selectProgram(program)"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                View Program
              </button>
            </div>
          </div>
        </div>

        <!-- No Programs -->
        <div *ngIf="!isLoading() && programs().length === 0" class="bg-white rounded-lg shadow-lg p-8 text-center">
          <p class="text-slate-600">No programs available</p>
        </div>
      </div>
    </div>
  `
})
export class BrowseProgramsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private programService = inject(ProgramBrowseService);
  private destroy$ = new Subject<void>();

  programs = signal<Program[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadPrograms();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPrograms() {
    this.isLoading.set(true);
    this.programService.getAllPrograms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (programs) => {
          this.programs.set(programs);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading programs:', err);
          this.isLoading.set(false);
        }
      });
  }

  selectProgram(program: Program) {
    this.router.navigate(['/programs/view', program.id]);
  }

  goBack() {
    this.router.navigate(['/subscriptions']);
  }
}
