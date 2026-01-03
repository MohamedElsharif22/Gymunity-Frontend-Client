import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ClientProgramsService } from '../../services/client-programs.service';
import { ProgramResponse } from '../../../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Program Details Component
 * Displays detailed information about a single program
 *
 * Responsibility:
 * - Fetch and display program details
 * - Show program metadata (trainer, duration, exercises)
 * - Navigate to weeks list
 *
 * Route parameter: programId
 * Service method: ClientProgramsService.getProgramById(programId)
 */
@Component({
  selector: 'app-program-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Back Button -->
        <button
          (click)="goBack()"
          class="mb-6 inline-flex items-center text-sky-600 hover:text-sky-700 font-medium"
        >
          ← Back to Programs
        </button>

        <!-- Loading State -->
        <div *ngIf="loading()" class="bg-white rounded-lg shadow p-8">
          <div class="flex items-center justify-center space-x-3">
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            <div class="w-3 h-3 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
            <span class="text-gray-600 ml-4">Loading program...</span>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error() }}
        </div>

        <!-- Program Details -->
        <div *ngIf="!loading() && program()" class="space-y-6">
          <!-- Hero Image -->
          <div *ngIf="program()!.thumbnailUrl" class="rounded-lg overflow-hidden shadow-lg">
            <img
              [src]="program()!.thumbnailUrl"
              [alt]="program()!.title"
              class="w-full h-80 object-cover"
            />
          </div>

          <!-- Header Card -->
          <div class="bg-white rounded-lg shadow p-8">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-4xl font-bold text-gray-900">{{ program()!.title }}</h1>
                <p class="text-gray-600 mt-2">{{ program()!.description }}</p>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-sky-600">
                  <span>{{ '$' }}</span><span>{{ program()!.price | number: '1.2-2' }}</span>
                </div>
                <p class="text-gray-500 text-sm">Total price</p>
              </div>
            </div>

            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
              <div>
                <span class="text-gray-500 text-sm">Type</span>
                <p class="font-semibold text-gray-900 mt-1">{{ program()!.type }}</p>
              </div>
              <div>
                <span class="text-gray-500 text-sm">Duration</span>
                <p class="font-semibold text-gray-900 mt-1">{{ program()!.durationWeeks }} weeks</p>
              </div>
              <div>
                <span class="text-gray-500 text-sm">Total Exercises</span>
                <p class="font-semibold text-gray-900 mt-1">{{ program()!.totalExercises }}</p>
              </div>
              <div>
                <span class="text-gray-500 text-sm">Clients</span>
                <p class="font-semibold text-gray-900 mt-1">{{ program()!.maxClients }}</p>
              </div>
            </div>

            <!-- Trainer Info -->
            <div class="mt-8 pt-8 border-t border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Trainer Information</h3>
              <div class="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-6 border border-sky-100">
                <!-- Trainer Name & Handle -->
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h4 class="text-xl font-bold text-gray-900">{{ program()!.trainerUserName || 'Unknown Trainer' }}</h4>
                    <p *ngIf="program()!.trainerHandle" class="text-sky-600 font-medium text-sm">
                      {{ program()!.trainerHandle }}
                    </p>
                  </div>
                  <div *ngIf="program()!.trainerProfileId" class="text-right">
                    <span class="inline-block bg-sky-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
                      ID: {{ program()!.trainerProfileId }}
                    </span>
                  </div>
                </div>

                <!-- Trainer Profile Link -->
                <div class="flex gap-3 pt-4 border-t border-sky-200">
                  <a
                    *ngIf="program()!.trainerProfileId"
                    [routerLink]="['/trainers', program()!.trainerProfileId]"
                    class="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition text-center text-sm"
                  >
                    View Trainer Profile
                  </a>
                  <a
                    *ngIf="program()!.trainerUserName"
                    [href]="'mailto:trainer@example.com'"
                    class="flex-1 bg-white hover:bg-gray-50 text-sky-600 font-semibold py-2 px-4 rounded-lg transition text-center text-sm border border-sky-200"
                  >
                    Contact Trainer
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Start Program Button -->
          <button
            [routerLink]="['/programs', program()!.id, 'weeks']"
            class="w-full bg-sky-600 text-white font-semibold py-3 rounded-lg hover:bg-sky-700 transition"
          >
            View Program Weeks →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProgramDetailsComponent implements OnInit, OnDestroy {
  private programsService = inject(ClientProgramsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  program = signal<ProgramResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const programId = this.route.snapshot.paramMap.get('programId');
    if (programId) {
      this.loadProgramDetails(programId);
    }
  }

  private loadProgramDetails(programId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.programsService
      .getProgramById(programId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (program) => {
          this.program.set(program);
          this.loading.set(false);
          console.log('[ProgramDetailsComponent] Program loaded:', program);
        },
        error: (err) => {
          this.loading.set(false);
          const errorMessage = err.error?.message || err.error?.errors?.[0] || 'Failed to load program.';
          this.error.set(errorMessage);
          console.error('[ProgramDetailsComponent] Error loading program:', err);
        }
      });
  }

  goBack() {
    this.router.navigate(['/programs']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
