import { Component, inject, signal, ChangeDetectionStrategy, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProgramService, Program } from '../../services/program.service';
import { TrainerDiscoveryService } from '../../../trainers/services/trainer-discovery.service';
import { HomeClientService, PackageClientResponse } from '../../../trainers/services/home-client.service';
import { TrainerProfile } from '../../../../core/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
 * Service method: ProgramService.getProgramById(programId)
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
            
            <!-- Loading State -->
            <div *ngIf="trainerLoading()" class="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-6 border border-sky-100">
              <div class="flex items-center justify-center space-x-2">
                <div class="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
                <div class="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
                <div class="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
                <span class="text-gray-600 text-sm ml-2">Loading trainer details...</span>
              </div>
            </div>

            <!-- Full Trainer Details -->
            <div *ngIf="!trainerLoading() && trainer()" class="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-6 border border-sky-100">
              <!-- Profile Section -->
              <div class="flex items-start gap-4 mb-6">
                <!-- Profile Photo -->
                <div class="flex-shrink-0">
                  <img
                    *ngIf="trainer()!.profilePhotoUrl"
                    [src]="trainer()!.profilePhotoUrl"
                    [alt]="trainer()!.userName || 'Trainer'"
                    class="w-20 h-20 rounded-full object-cover border-2 border-sky-200"
                  />
                  <div
                    *ngIf="!trainer()!.profilePhotoUrl"
                    class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl border-2 border-sky-200"
                  >
                    {{ (trainer()!.userName || 'T').charAt(0).toUpperCase() }}
                  </div>
                </div>

                <!-- Trainer Info -->
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h4 class="text-xl font-bold text-gray-900">{{ trainer()!.userName || 'Unknown Trainer' }}</h4>
                  </div>
                  <p class="text-sky-600 font-medium text-sm mt-1">{{ trainer()!.specialization || 'Fitness Trainer' }}</p>
                  <p *ngIf="trainer()!.bio" class="text-gray-600 text-sm mt-2 max-w-md">{{ trainer()!.bio }}</p>
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-3 gap-3 mb-6 py-4 border-y border-sky-200">
                <div class="text-center">
                  <p class="text-2xl font-bold text-gray-900">{{ trainer()!.yearsOfExperience || 0 }}</p>
                  <p class="text-xs text-gray-600">Years</p>
                </div>
                <div class="text-center">
                  <div class="flex items-center justify-center gap-1">
                    <span class="text-lg font-bold text-gray-900">{{ (trainer()!.rating || 0).toFixed(1) }}</span>
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <p class="text-xs text-gray-600">Rating</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-gray-900">{{ trainer()!.totalClients || 0 }}</p>
                  <p class="text-xs text-gray-600">Clients</p>
                </div>
              </div>

              <!-- Specializations -->
              <!-- <div *ngIf="trainer()!.specializations && trainer()!.specializations.length > 0" class="mb-4">
                <p class="text-xs font-semibold text-gray-700 mb-2">Specializations</p>
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let spec of trainer()!.specializations.slice(0, 4)" class="text-xs bg-sky-200 text-sky-800 px-2 py-1 rounded">
                    {{ spec }}
                  </span>
                </div>
              </div> -->

              <!-- Trainer Profile Link -->
              <div class="flex gap-3 pt-4 border-t border-sky-200">
                <a
                  [routerLink]="['/trainers', trainer()!.userId]"
                  class="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition text-center text-sm"
                >
                  View Full Profile
                </a>
              </div>
            </div>

            <!-- Fallback to Basic Trainer Info -->
            <div *ngIf="!trainerLoading() && !trainer()" class="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-6 border border-sky-100">
              <div class="mb-4">
                <h4 class="text-xl font-bold text-gray-900">{{ program()!.trainerUserName || 'Unknown Trainer' }}</h4>
                <p *ngIf="program()!.trainerHandle" class="text-sky-600 font-medium text-sm mt-1">
                  @{{ program()!.trainerHandle }}
                </p>
              </div>
              
              <div *ngIf="program()!.trainerHandle" class="flex gap-3 pt-4 border-t border-sky-200">
                <a
                  [routerLink]="['/trainers', program()!.trainerHandle]"
                  class="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition text-center text-sm"
                >
                  View Trainer Profile
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

          <!-- Packages Containing This Program Section -->
          <div class="bg-white rounded-lg shadow p-8 mt-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Available Packages</h3>
            
            <!-- Loading State -->
            <div *ngIf="packagesLoading()" class="bg-gray-50 rounded-lg p-6 text-center">
              <div class="flex items-center justify-center space-x-2">
                <div class="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
                <div class="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
                <div class="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
              </div>
              <p class="text-gray-600 mt-2">Loading packages...</p>
            </div>

            <!-- Packages List -->
            <div *ngIf="!packagesLoading() && packages().length > 0" class="space-y-4">
              <div *ngFor="let pkg of packages()" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-gray-900">{{ pkg.name }}</h4>
                    <p class="text-gray-600 text-sm mt-1">{{ pkg.description }}</p>
                    <div class="mt-3 flex items-center gap-4">
                      <span class="text-lg font-bold text-sky-600">\${{ pkg.priceMonthly | number: '1.2-2' }}/month</span>
                      <span *ngIf="pkg.priceYearly" class="text-sm text-gray-500">\${{ pkg.priceYearly | number: '1.2-2' }}/year</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!packagesLoading() && packages().length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
              <p class="text-gray-600">No packages available with this program.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProgramDetailsComponent implements OnInit {
  private programsService = inject(ProgramService);
  private trainerDiscoveryService = inject(TrainerDiscoveryService);
  private homeClientService = inject(HomeClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  program = signal<Program | null>(null);
  trainer = signal<TrainerProfile | null>(null);
  packages = signal<PackageClientResponse[]>([]);
  loading = signal(false);
  trainerLoading = signal(false);
  packagesLoading = signal(false);
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
      .getProgramById(+programId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (program) => {
          this.program.set(program);
          this.loading.set(false);
          console.log('[ProgramDetailsComponent] Program loaded:', program);
          
          // Load trainer details using trainer handle if available
          if (program.trainerHandle) {
            this.loadTrainerDetails(program.trainerHandle);
          }
          
          // Load packages containing this program
          this.loadPackagesWithProgram(program.id);
        },
        error: (err) => {
          this.loading.set(false);
          const errorMessage = err.error?.message || err.error?.errors?.[0] || 'Failed to load program.';
          this.error.set(errorMessage);
          console.error('[ProgramDetailsComponent] Error loading program:', err);
        }
      });
  }

  private loadTrainerDetails(trainerHandle: string) {
    this.trainerLoading.set(true);

    this.trainerDiscoveryService
      .searchTrainers({ search: trainerHandle })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const trainer = response?.items?.[0];
          if (trainer) {
            // Cast TrainerCard to TrainerProfile (compatible types)
            this.trainer.set(trainer as unknown as TrainerProfile);
            this.trainerLoading.set(false);
            console.log('[ProgramDetailsComponent] Trainer profile loaded:', trainer);
          } else {
            this.trainerLoading.set(false);
            console.log('[ProgramDetailsComponent] No trainer found for handle:', trainerHandle);
          }
        },
        error: (err) => {
          this.trainerLoading.set(false);
          console.error('[ProgramDetailsComponent] Error loading trainer profile:', err);
          // Don't show error for trainer loading, it's not critical
        }
      });
  }

  private loadPackagesWithProgram(programId: number) {
    this.packagesLoading.set(true);

    this.homeClientService
      .getAllPackages()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (allPackages) => {
          // Filter packages that contain this program
          const packagesWithProgram = allPackages.filter(pkg => {
            return pkg.programs && Array.isArray(pkg.programs) && 
                   pkg.programs.some((prog: any) => prog.id === programId);
          });
          
          this.packages.set(packagesWithProgram);
          this.packagesLoading.set(false);
          console.log('[ProgramDetailsComponent] Packages with program loaded:', packagesWithProgram);
        },
        error: (err) => {
          this.packagesLoading.set(false);
          console.error('[ProgramDetailsComponent] Error loading packages:', err);
        }
      });
  }

  goBack() {
    this.router.navigate(['/programs']);
  }
}
