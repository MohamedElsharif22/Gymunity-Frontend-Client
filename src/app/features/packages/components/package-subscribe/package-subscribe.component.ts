import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SubscriptionService, SubscribePackageRequest, SubscriptionResponse } from '../../services/subscription.service';
import { PackageDetails } from '../../../../core/models';

@Component({
  selector: 'app-package-subscribe',
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
          Back to Packages
        </button>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex justify-center items-center min-h-96">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        } @else if (packageData()) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Package Details -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow-md p-8">
                <!-- Header -->
                <div class="mb-6">
                  <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ packageData()?.name }}</h1>
                  <p class="text-gray-600">
                    Trainer ID: <span class="font-semibold text-sky-600">{{ packageData()?.trainerId }}</span>
                  </p>
                </div>

                <!-- Description -->
                <div class="mb-8">
                  <p class="text-gray-700 text-lg leading-relaxed">
                    {{ packageData()?.description }}
                  </p>
                </div>

                <!-- Package Info Grid -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
                  <div>
                    <p class="text-sm text-gray-600 mb-2">Duration</p>
                    <div class="flex items-center gap-2">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          [checked]="!isAnnual()"
                          (change)="isAnnual.set(false)"
                          class="w-4 h-4" />
                        <span class="text-sm">Monthly</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          [checked]="isAnnual()"
                          (change)="isAnnual.set(true)"
                          class="w-4 h-4" />
                        <span class="text-sm">Yearly</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <p class="text-sm text-gray-600 mb-2">Status</p>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          [class]="packageData()?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                      {{ packageData()?.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>

                <!-- Features Section -->
                @if (packageData()?.programs && packageData()?.programs!.length > 0) {
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Programs Included</h3>
                    <ul class="space-y-3">
                      @for (program of packageData()?.programs; track program.title) {
                        <li class="flex items-start gap-3">
                          <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                          <span class="text-gray-700">{{ program.title }}</span>
                        </li>
                      }
                      <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        <span class="text-gray-700">Expert trainer guidance</span>
                      </li>
                      <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        <span class="text-gray-700">24/7 access to all programs</span>
                      </li>
                    </ul>
                  </div>
                }
              </div>
            </div>

            <!-- Pricing Card -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <!-- Price -->
                <div class="mb-6">
                  <p class="text-sm text-gray-600 mb-2">Price</p>
                  <div class="flex items-baseline gap-1">
                    <span class="text-4xl font-bold text-sky-600">
                      {{ isAnnual() ? formatPrice(packageData()?.priceYearly) : formatPrice(packageData()?.priceMonthly) }}
                    </span>
                    <span class="text-gray-600">{{ isAnnual() ? '/year' : '/month' }}</span>
                  </div>
                  @if (isAnnual() && packageData()?.priceMonthly) {
                    <p class="text-xs text-gray-500 mt-2">
                      That's only {{ formatPrice((packageData()?.priceYearly || 0) / 12) }}/month
                    </p>
                  }
                </div>

                <!-- CTA Buttons -->
                @if (!successMessage()) {
                  <button
                    (click)="subscribeNow()"
                    [disabled]="isSubscribing() || !packageData()?.isActive"
                    class="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition mb-4">
                    {{ isSubscribing() ? 'Processing...' : 'اشترك الان' }}
                  </button>
                } @else {
                  <button
                    (click)="proceedToPayment()"
                    class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition mb-4 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                    Proceed to Payment
                  </button>
                }

                <!-- Error Message -->
                @if (errorMessage()) {
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p class="text-red-800 text-sm">{{ errorMessage() }}</p>
                  </div>
                }

                <!-- Success Message -->
                @if (successMessage()) {
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p class="text-green-800 text-sm">{{ successMessage() }}</p>
                  </div>
                }

                <!-- Info Box -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-xs text-blue-900 mb-2 font-semibold">ℹ️ How it works</p>
                  <ol class="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Subscribe to the package</li>
                    <li>Proceed to payment</li>
                    <li>Start your training</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        } @else if (error()) {
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Package not found</h3>
            <p class="mt-2 text-gray-500">The package you're looking for doesn't exist.</p>
            <button
              (click)="goBack()"
              class="mt-4 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition">
              Back to Packages
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class PackageSubscribeComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  packageId!: number;
  packageData = signal<PackageDetails | null>(null);
  isLoading = signal(false);
  isSubscribing = signal(false);
  error = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isAnnual = signal(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.packageId = parseInt(params['id'], 10);
    });
  }

  subscribeNow() {
    if (!this.packageData()) return;

    this.isSubscribing.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request: SubscribePackageRequest = {
      packageId: this.packageId,
      isAnnual: this.isAnnual()
    };

    this.subscriptionService.subscribe(request).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.successMessage.set('✓ Subscription created successfully! Click "Proceed to Payment" to continue.');
          // Store subscription ID to use in payment
          sessionStorage.setItem('subscriptionId', response.data.id.toString());
          sessionStorage.setItem('subscriptionData', JSON.stringify(response.data));
        } else {
          this.errorMessage.set(response.message || 'Failed to create subscription');
        }
        this.isSubscribing.set(false);
      },
      error: (err: any) => {
        console.error('Error subscribing:', err);
        this.errorMessage.set(err.error?.message || 'Failed to create subscription. Please try again.');
        this.isSubscribing.set(false);
      }
    });
  }

  proceedToPayment() {
    const subscriptionId = sessionStorage.getItem('subscriptionId');
    if (subscriptionId) {
      this.router.navigate(['/payment', subscriptionId]);
    } else {
      this.errorMessage.set('Subscription data not found. Please try again.');
    }
  }

  formatPrice(price: number | undefined | null): string {
    if (!price) return '$0.00';
    return '$' + price.toFixed(2);
  }

  goBack() {
    this.router.navigate(['/packages']);
  }
}
