import { HomeClientService, PackageClientResponse, TrainerClientResponse } from './../../trainers/services/home-client.service';
import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TrainerCard } from '../../../core/models';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface PackageGroup {
  trainer: TrainerClientResponse;
  packages: PackageClientResponse[];
}

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-12 text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-3">Training Packages</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Discover specialized training packages from our expert trainers. Each package is tailored to help you achieve your fitness goals.</p>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex justify-center items-center min-h-96">
            <div class="text-center">
              <div class="animate-spin rounded-full h-16 w-16 border-4 border-sky-600 border-t-transparent mx-auto mb-4"></div>
              <p class="text-gray-600 font-medium">Loading packages...</p>
            </div>
          </div>
        } @else if (packages().length === 0) {
          <div class="text-center py-16 bg-white rounded-lg shadow">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">No packages found</h3>
            <p class="text-gray-600">No training packages are available at the moment.</p>
          </div>
        } @else if (trainers().length === 0) {
          <div class="text-center py-16 bg-white rounded-lg shadow">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292m0 0H7.465M4.5 15H21m-16.5-6h16.5"></path>
            </svg>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">No trainers found</h3>
            <p class="text-gray-600">Unable to load trainer information. Please refresh the page.</p>
          </div>
        } @else if (packageGroups().length === 0) {
          <div class="text-center py-16 bg-white rounded-lg shadow">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">No matching packages</h3>
            <p class="text-gray-600">Packages loaded ({{ packages().length }}) but no trainers matched.</p>
            <p class="text-sm text-gray-500 mt-4">This may indicate a data mismatch. Check the browser console for details.</p>
          </div>
        } @else {
          <!-- Grouped Packages by Trainer -->
          <div class="space-y-16">
            @for (group of packageGroups(); track group.trainer.id) {
              <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <!-- Trainer Cover Image -->
                @if (group.trainer.coverImageUrl) {
                  <div class="h-64 w-full overflow-hidden">
                    <img 
                      [src]="group.trainer.coverImageUrl" 
                      [alt]="group.trainer.userName"
                      class="w-full h-full object-cover">
                  </div>
                } @else {
                  <div class="h-64 w-full bg-gradient-to-r from-sky-400 to-indigo-600"></div>
                }

                <!-- Trainer Header Section -->
                <div class="bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-8 md:px-8 md:py-10 -mt-16 relative z-10">
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <!-- Trainer Info -->
                    <div class="flex items-start gap-4">
                      <!-- Trainer Avatar -->
                      <div class="flex-shrink-0">
                        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                          @if (group.trainer.coverImageUrl) {
                            <img 
                              [src]="group.trainer.coverImageUrl" 
                              [alt]="group.trainer.userName"
                              class="w-full h-full object-cover rounded-full">
                          } @else {
                            {{ group.trainer.userName.charAt(0).toUpperCase() }}
                          }
                        </div>
                      </div>

                      <!-- Trainer Details -->
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <h2 class="text-3xl font-bold text-white">{{ group.trainer.userName }}</h2>
                          @if (group.trainer.isVerified) {
                            <svg class="w-7 h-7 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                          }
                        </div>
                        <p class="text-sky-100 text-base font-medium mb-3">@{{ group.trainer.handle }}</p>
                        @if (group.trainer.bio) {
                          <p class="text-sky-50 text-sm max-w-xl line-clamp-3">{{ group.trainer.bio }}</p>
                        }
                        @if (group.trainer.startingPrice) {
                          <p class="text-sky-100 text-sm mt-3 font-semibold">Starting from \${{ group.trainer.startingPrice }}/month</p>
                        }
                      </div>
                    </div>

                    <!-- Trainer Stats -->
                    <div class="flex gap-6 md:flex-col lg:flex-row">
                      @if (group.trainer.ratingAverage) {
                        <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                          <div class="flex items-center justify-center gap-1 mb-1">
                            <span class="text-2xl font-bold text-white">{{ (group.trainer.ratingAverage || 0).toFixed(1) }}</span>
                            <svg class="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          </div>
                          <p class="text-sky-100 text-xs">Rating</p>
                        </div>
                      }
                      @if (group.trainer.totalClients) {
                        <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                          <p class="text-2xl font-bold text-white">{{ group.trainer.totalClients }}</p>
                          <p class="text-sky-100 text-xs">Clients</p>
                        </div>
                      }
                      @if (group.trainer.yearsExperience) {
                        <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                          <p class="text-2xl font-bold text-white">{{ group.trainer.yearsExperience }}</p>
                          <p class="text-sky-100 text-xs">Years</p>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- View Trainer Profile Button -->
                  <div class="mt-6">
                    <button
                      [routerLink]="['/discover/trainers', group.trainer.userId]"
                      [state]="{ trainer: group.trainer }"
                      class="inline-flex items-center gap-2 bg-white hover:bg-sky-50 text-sky-600 font-semibold py-2 px-6 rounded-lg transition">
                      <span>View Full Profile</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Packages Grid -->
                <div class="p-6 md:p-8">
                  <h3 class="text-xl font-bold text-gray-900 mb-6">{{ group.trainer.userName }}'s Packages</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @for (pkg of group.packages; track pkg.id) {
                      <div class="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-xl hover:border-sky-300 transition-all duration-300 overflow-hidden flex flex-col">
                        <!-- Package Thumbnail -->
                        @if (pkg.thumbnailUrl) {
                          <div class="h-40 bg-gradient-to-br from-sky-400 to-indigo-500 overflow-hidden">
                            <img 
                              [src]="pkg.thumbnailUrl" 
                              [alt]="pkg.name"
                              class="w-full h-full object-cover">
                          </div>
                        } @else {
                          <div class="h-40 bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
                            <svg class="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m0 0l8-4m-8 4v10l8 4m0-10l8-4m-8 4v10l8-4m-8-4l8-4"/>
                            </svg>
                          </div>
                        }

                        <!-- Package Content -->
                        <div class="p-5 flex-1 flex flex-col">
                          <!-- Package Name -->
                          <h4 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{{ pkg.name }}</h4>
                          
                          <!-- Package Description -->
                          @if (pkg.description) {
                            <p class="text-sm text-gray-600 mb-4 line-clamp-3">{{ pkg.description }}</p>
                          }

                          <!-- Programs Count -->
                          @if (pkg.programs && pkg.programs.length > 0) {
                            <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                              <p class="text-xs text-blue-700 font-medium">
                                <span class="font-bold">{{ pkg.programs.length }}</span> programs included
                              </p>
                            </div>
                          }

                          <!-- Status Badge -->
                          <div class="mb-4">
                            <span [class]="pkg.isActive ? 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800' : 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800'">
                              <span class="w-2 h-2 rounded-full" [class]="pkg.isActive ? 'bg-green-600' : 'bg-gray-600'"></span>
                              {{ pkg.isActive ? 'Active' : 'Inactive' }}
                            </span>
                          </div>

                          <!-- Pricing -->
                          <div class="border-t border-gray-200 pt-4 mt-auto">
                            <div class="mb-4">
                              <p class="text-xs text-gray-600 mb-1">Monthly Price</p>
                              <div class="flex items-baseline gap-1">
                                <span class="text-3xl font-bold text-sky-600">{{ formatPrice(pkg.priceMonthly) }}</span>
                                <span class="text-gray-600 text-sm">/month</span>
                              </div>
                            </div>
                            @if (pkg.priceYearly) {
                              <p class="text-xs text-gray-600 mb-3">
                                Yearly: <span class="font-semibold text-gray-900">{{ formatPrice(pkg.priceYearly) }}</span>
                              </p>
                            }
                          </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="px-5 pb-5 space-y-2">
                          <button
                            (click)="viewPackageDetails(pkg.id)"
                            class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                            View Details
                          </button>
                          <button
                            (click)="subscribeToPackage(pkg.id)"
                            [disabled]="!pkg.isActive"
                            class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition">
                            Subscribe Now
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class PackagesComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private homeClientService = inject(HomeClientService);
  
  packages = signal<PackageClientResponse[]>([]);
  trainers = signal<TrainerClientResponse[]>([]);
  packageGroups = signal<PackageGroup[]>([]);
  isLoading = signal(false);
  
  ngOnInit() {
    this.loadPackagesAndTrainers();
  }

  private loadPackagesAndTrainers() {
    this.isLoading.set(true);
    
    // Load both packages and trainers in parallel
    forkJoin({
      packages: this.homeClientService.getAllPackages().pipe(
        catchError(err => {
          console.error('[PackagesComponent] Error loading packages:', err);
          return of([]);
        })
      ),
      trainers: this.homeClientService.getAllTrainers().pipe(
        catchError(err => {
          console.error('[PackagesComponent] Error loading trainers:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: (response) => {
        const packages = response.packages || [];
        const trainers = response.trainers || [];
        
        console.log('[PackagesComponent] API Response:');
        console.log('[PackagesComponent] Packages count:', packages.length);
        console.log('[PackagesComponent] Packages data:', packages);
        console.log('[PackagesComponent] Trainers count:', trainers.length);
        console.log('[PackagesComponent] Trainers data:', trainers);
        
        this.packages.set(packages);
        this.trainers.set(trainers);
        
        // Group all packages by trainer (no filtering)
        this.groupPackagesByTrainer(packages, trainers);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('[PackagesComponent] Fatal error loading data:', error);
        this.isLoading.set(false);
      }
    });
  }

  private groupPackagesByTrainer(packages: PackageClientResponse[], trainers: TrainerClientResponse[]): void {
    console.log('[PackagesComponent] ========== GROUPING DEBUG START ==========');
    console.log('[PackagesComponent] Packages count:', packages.length);
    console.log('[PackagesComponent] Trainers count:', trainers.length);
    console.log('[PackagesComponent] Packages:', packages);
    console.log('[PackagesComponent] Trainers:', trainers);
    
    const groups: PackageGroup[] = [];
    
    // If no trainers, create groups with undefined trainer (show packages anyway)
    if (trainers.length === 0) {
      console.warn('[PackagesComponent] No trainers loaded - creating groups without trainer data');
      
      // Group packages by trainerId even without trainer data
      const packagesByTrainerId = new Map<string | number, PackageClientResponse[]>();
      
      packages.forEach(pkg => {
        const key = pkg.trainerId;
        if (!packagesByTrainerId.has(key)) {
          packagesByTrainerId.set(key, []);
        }
        packagesByTrainerId.get(key)!.push(pkg);
      });
      
      // Create groups without trainer info
      packagesByTrainerId.forEach((pkgs, trainerId) => {
        const mockTrainer: TrainerClientResponse = {
          id: parseInt(String(trainerId), 10) || 0,
          userId: String(trainerId),
          userName: `Trainer ${trainerId}`,
          handle: 'unknown',
          bio: '',
          isVerified: false,
          ratingAverage: 0,
          totalClients: 0,
          yearsExperience: 0,
          totalReviews: 0,
          hasActiveSubscription: false
        };
        
        groups.push({
          trainer: mockTrainer,
          packages: pkgs
        });
      });
      
      this.packageGroups.set(groups);
      console.log('[PackagesComponent] Groups created (without trainer data):', groups);
      return;
    }

    // Build trainer map for lookup
    const trainerMap = new Map<string, TrainerClientResponse>();
    const trainerMapById = new Map<number, TrainerClientResponse>();
    
    trainers.forEach(trainer => {
      if (trainer.userId) {
        trainerMap.set(String(trainer.userId).toLowerCase(), trainer);
      }
      if (trainer.id) {
        trainerMapById.set(trainer.id, trainer);
      }
    });

    console.log('[PackagesComponent] Trainer map by userId:', Array.from(trainerMap.keys()));
    console.log('[PackagesComponent] Trainer map by id:', Array.from(trainerMapById.keys()));

    const unmatchedPackages: PackageClientResponse[] = [];

    // Group packages by trainer
    packages.forEach((pkg: any) => {
      let trainer: TrainerClientResponse | undefined;
      
      // Try to match by trainerId (could be string or number)
      const trainerIdStr = String(pkg.trainerId).toLowerCase();
      const trainerIdNum = parseInt(pkg.trainerId, 10);
      
      trainer = trainerMap.get(trainerIdStr) || trainerMapById.get(trainerIdNum);
      
      if (trainer) {
        console.log(`[PackagesComponent] ✓ Package '${pkg.name}' matched to trainer '${trainer.userName}'`);
        
        let group = groups.find(g => g.trainer.id === trainer!.id);
        if (!group) {
          group = { trainer, packages: [] };
          groups.push(group);
        }
        group.packages.push(pkg);
      } else {
        console.warn(`[PackagesComponent] ✗ NO TRAINER FOUND for package '${pkg.name}' (trainerId: '${pkg.trainerId}')`);
        unmatchedPackages.push(pkg);
      }
    });

    // Sort groups by trainer name
    groups.sort((a, b) => a.trainer.userName.localeCompare(b.trainer.userName));
    
    console.log('[PackagesComponent] Total groups:', groups.length);
    console.log('[PackagesComponent] Unmatched packages:', unmatchedPackages.length);
    
    if (unmatchedPackages.length > 0) {
      console.warn('[PackagesComponent] Unmatched packages:', unmatchedPackages);
    }
    
    this.packageGroups.set(groups);
    console.log('[PackagesComponent] ========== GROUPING DEBUG END ==========');
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '$0.00';
    return '$' + price.toFixed(2);
  }

  viewPackageDetails(packageId: number) {
    this.router.navigate(['/packages', packageId]);
  }

  subscribeToPackage(packageId: number) {
    this.router.navigate(['/packages', packageId, 'subscribe']);
  }
}
