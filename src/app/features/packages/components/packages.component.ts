import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Package, PackageDetails } from '../../../core/models';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Available Packages</h1>
          <p class="text-gray-600">Browse and explore our training packages</p>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex justify-center items-center min-h-96">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        } @else if (packages().length === 0) {
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">No packages available</h3>
            <p class="mt-2 text-gray-500">There are no packages available at the moment.</p>
          </div>
        } @else {
          <!-- Packages Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (pkg of packages(); track pkg.id) {
              <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <!-- Package Header -->
                <div class="p-6 border-b border-gray-200">
                  <h2 class="text-xl font-bold text-gray-900 mb-2">{{ pkg.name }}</h2>
                  <p class="text-gray-600 text-sm mb-4">{{ pkg.description }}</p>

                  <!-- Price -->
                  <div class="mb-4">
                    <div class="flex items-baseline gap-1">
                      <span class="text-3xl font-bold text-sky-600">{{ formatPrice(pkg.priceMonthly) }}</span>
                      <span class="text-gray-500 text-sm">/month</span>
                    </div>
                  </div>
                </div>

                <!-- Package Details -->
                <div class="px-6 py-4">
                  <dl class="space-y-3 text-sm">
                    <!-- Trainer ID -->
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Trainer ID</dt>
                      <dd class="font-medium text-gray-900 truncate">{{ pkg.trainerId }}</dd>
                    </div>

                    <!-- Yearly Price -->
                    @if (pkg.priceYearly) {
                      <div class="flex justify-between">
                        <dt class="text-gray-600">Yearly Price</dt>
                        <dd class="font-medium text-gray-900">{{ '$' }}{{ formatNumber(pkg.priceYearly) }}</dd>
                      </div>
                    }

                    <!-- Number of Programs -->
                    @if (pkg.programs && pkg.programs.length > 0) {
                      <div class="flex justify-between">
                        <dt class="text-gray-600">Programs</dt>
                        <dd class="font-medium text-gray-900">{{ pkg.programs.length }}</dd>
                      </div>
                    }

                    <!-- Status -->
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Status</dt>
                      <dd>
                        <span [class]="pkg.isActive ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800' : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'">
                          {{ pkg.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <!-- Action Buttons -->
                <div class="px-6 py-4 bg-gray-50 space-y-2">
                  <button
                    (click)="viewPackageDetails(pkg.id)"
                    class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                    View Details
                  </button>
                  <button
                    (click)="subscribeToPackage(pkg.id)"
                    [disabled]="!pkg.isActive"
                    class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition">
                    اشترك الان
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class PackagesComponent implements OnInit {
  private router = inject(Router);

  packages = signal<PackageDetails[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    // Note: loadPackages() method removed - packages should be loaded from API
    // This component is pending implementation to fetch packages from backend
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '$0.00';
    return '$' + price.toFixed(2);
  }

  formatNumber(num: number | undefined): string {
    if (!num) return '0.00';
    return num.toFixed(2);
  }

  viewPackageDetails(packageId: number) {
    this.router.navigate(['/packages', packageId]);
  }

  subscribeToPackage(packageId: number) {
    this.router.navigate(['/packages', packageId]);
  }
}
