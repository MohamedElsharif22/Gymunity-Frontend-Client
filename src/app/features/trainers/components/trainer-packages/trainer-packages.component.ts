import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HomeClientService, PackageClientResponse, TrainerClientResponse } from '../../services/home-client.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Trainer Packages Component
 * Displays all packages from a specific trainer
 * Route: /trainers/:id/packages or via query param trainerId
 */
@Component({
  selector: 'app-trainer-packages',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 bg-gray-50 py-8 px-4 md:px-8">
      <div class="max-w-6xl mx-auto">
        <!-- Back Button -->
        <button
          (click)="goBack()"
          class="mb-6 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition"
        >
          ← Back
        </button>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="bg-white rounded-lg shadow p-8">
            <div class="flex flex-col items-center justify-center">
              <div class="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <p class="mt-4 text-gray-600">Loading trainer packages...</p>
            </div>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p class="text-red-800 font-medium">{{ error() }}</p>
            <button
              (click)="loadData()"
              class="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        }

        <!-- Trainer Header -->
        @if (!isLoading() && !error() && trainer()) {
          <div class="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
            <!-- Trainer Info Row -->
            <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div
                  class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg"
                >
                  {{ trainer()!.userName.charAt(0).toUpperCase() }}
                </div>
              </div>

              <!-- Trainer Details -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h1 class="text-3xl font-bold text-gray-900">{{ trainer()!.userName }}</h1>
                  @if (trainer()!.isVerified) {
                    <svg class="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  }
                </div>
                <p class="text-gray-600 text-lg mb-3">@{{ trainer()!.handle }}</p>
                @if (trainer()!.bio) {
                  <p class="text-gray-700 max-w-2xl">{{ trainer()!.bio }}</p>
                }
              </div>

              <!-- Stats -->
              <div class="flex gap-4">
                @if (trainer()!.ratingAverage) {
                  <div class="text-center">
                    <div class="flex items-center justify-center gap-1 mb-1">
                      <span class="text-2xl font-bold text-gray-900">{{ (trainer()!.ratingAverage || 0).toFixed(1) }}</span>
                      <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600">Rating</p>
                  </div>
                }
                @if (trainer()!.totalClients) {
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">{{ trainer()!.totalClients }}</p>
                    <p class="text-sm text-gray-600">Clients</p>
                  </div>
                }
                @if (trainer()!.yearsExperience) {
                  <div class="text-center">
                    <p class="text-2xl font-bold text-gray-900">{{ trainer()!.yearsExperience }}</p>
                    <p class="text-sm text-gray-600">Years</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Packages Section -->
        @if (!isLoading() && !error()) {
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Section Header -->
            <div class="bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-8 md:px-8">
              <h2 class="text-3xl font-bold text-white">Training Packages</h2>
              <p class="text-sky-100 mt-2">Explore all available packages from this trainer</p>
            </div>

            <!-- Packages Grid -->
            <div class="p-6 md:p-8">
              @if (packages().length === 0) {
                <div class="text-center py-16">
                  <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                  <h3 class="text-2xl font-bold text-gray-900 mb-2">No Packages Found</h3>
                  <p class="text-gray-600">This trainer hasn't published any packages yet.</p>
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  @for (pkg of packages(); track pkg.id) {
                    <div class="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-xl hover:border-sky-300 transition-all duration-300 overflow-hidden flex flex-col">
                      <!-- Package Header -->
                      @if (pkg.thumbnailUrl) {
                        <div class="h-48 bg-gradient-to-r from-sky-400 to-indigo-500 overflow-hidden">
                          <img 
                            [src]="pkg.thumbnailUrl" 
                            [alt]="pkg.name"
                            class="w-full h-full object-cover">
                        </div>
                      } @else {
                        <div class="h-48 bg-gradient-to-r from-sky-400 to-indigo-500"></div>
                      }

                      <!-- Package Content -->
                      <div class="p-6 flex-1 flex flex-col">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ pkg.name }}</h3>
                        @if (pkg.description) {
                          <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{{ pkg.description }}</p>
                        }

                        <!-- Price Section -->
                        <div class="space-y-3 mb-6 pt-4 border-t border-gray-200">
                          @if (pkg.priceMonthly) {
                            <div class="flex items-center justify-between">
                              <span class="text-gray-600">Monthly</span>
                              <span class="text-2xl font-bold text-sky-600">\${{ pkg.priceMonthly }}</span>
                            </div>
                          }
                          @if (pkg.priceYearly) {
                            <div class="flex items-center justify-between">
                              <span class="text-gray-600">Yearly</span>
                              <span class="text-2xl font-bold text-indigo-600">\${{ pkg.priceYearly }}</span>
                            </div>
                          }
                        </div>

                        <!-- Action Buttons -->
                        <div class="space-y-2 mt-auto">
                          <button
                            (click)="viewPackageDetails(pkg.id)"
                            class="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            View Details
                          </button>
                          <button
                            (click)="subscribeToPackage(pkg.id)"
                            class="w-full border-2 border-sky-500 hover:bg-sky-50 text-sky-600 font-semibold py-2 px-4 rounded-lg transition-colors">
                            Subscribe
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class TrainerPackagesComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private homeClientService = inject(HomeClientService);
  private location = inject(Location);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  trainer = signal<TrainerClientResponse | null>(null);
  packages = signal<PackageClientResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    // Get trainer ID from route params or query params
    let trainerId: string | null = this.activatedRoute.snapshot.paramMap.get('id');
    
    if (!trainerId) {
      this.activatedRoute.queryParams.subscribe(params => {
        if (params['trainerId']) {
          trainerId = params['trainerId'];
          this.fetchTrainerAndPackages(trainerId!);
        }
      });
    } else {
      this.fetchTrainerAndPackages(trainerId);
    }
  }

  private fetchTrainerAndPackages(trainerId: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      trainer: this.homeClientService.getTrainerById(parseInt(trainerId, 10)).pipe(
        catchError(err => {
          console.error('[TrainerPackagesComponent] Error loading trainer:', err);
          return of(null);
        })
      ),
      packages: this.homeClientService.getPackagesByTrainer(trainerId).pipe(
        catchError(err => {
          console.error('[TrainerPackagesComponent] Error loading packages:', err);
          return of([]);
        })
      )
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response: any) => {
        if (response.trainer) {
          this.trainer.set(response.trainer);
        } else {
          this.error.set('Unable to load trainer information');
        }
        this.packages.set(response.packages || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[TrainerPackagesComponent] Fatal error:', err);
        this.error.set('An error occurred while loading data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  viewPackageDetails(packageId: number): void {
    this.router.navigate(['/packages', packageId]);
  }

  subscribeToPackage(packageId: number): void {
    this.router.navigate(['/packages', packageId, 'subscribe']);
  }
}
