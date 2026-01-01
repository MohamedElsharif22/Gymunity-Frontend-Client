import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SubscriptionService, SubscriptionResponse } from '../../../packages/services/subscription.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Success Card -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <!-- Icon Section -->
          <div class="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
            <div class="flex justify-center mb-4">
              <div class="bg-white rounded-full p-3">
                <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p class="text-green-100">Your subscription is now active</p>
          </div>

          <!-- Content Section -->
          <div class="p-8">
            @if (isLoading()) {
              <div class="flex justify-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            } @else if (subscription()) {
              <div class="space-y-6">
                <!-- Subscription Status -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p class="text-green-800 font-semibold">
                    {{ subscription()?.packageName }} - Active
                  </p>
                  <p class="text-sm text-green-700 mt-1">
                    Trainer: {{ subscription()?.trainerName }}
                  </p>
                </div>

                <!-- Period Info -->
                <div class="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p class="text-sm text-gray-600">Start Date</p>
                    <p class="font-semibold text-gray-900">{{ subscription()?.startDate | date: 'MMM dd, yyyy' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">End Date</p>
                    <p class="font-semibold text-gray-900">{{ subscription()?.currentPeriodEnd | date: 'MMM dd, yyyy' }}</p>
                  </div>
                </div>

                <!-- Amount Paid -->
                <div class="border-t pt-4">
                  <p class="text-sm text-gray-600 mb-2">Amount Paid</p>
                  <p class="text-3xl font-bold text-green-600"><span class="text-lg">$</span>{{ formatPrice(subscription()?.amountPaid) }}</p>
                </div>

                <!-- Action Buttons -->
                <div class="grid grid-cols-2 gap-4 pt-4 border-t">
                  <button
                    (click)="viewPackages()"
                    class="py-2 px-4 border-2 border-sky-600 text-sky-600 font-semibold rounded-lg hover:bg-sky-50 transition">
                    View Packages
                  </button>
                  <button
                    (click)="goToDashboard()"
                    class="py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition">
                    Dashboard
                  </button>
                </div>
              </div>
            } @else if (error()) {
              <div class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900">Unable to load subscription</h3>
                <p class="mt-2 text-gray-500">The subscription details could not be loaded.</p>
                <button
                  (click)="goToDashboard()"
                  class="mt-4 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                  Go to Dashboard
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Info Section -->
        <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="font-semibold text-blue-900 mb-3">Next Steps</h3>
          <ul class="text-sm text-blue-800 space-y-2">
            <li>Your subscription has been activated</li>
            <li>You can now access all training programs</li>
            <li>Your trainer has been notified</li>
            <li>Go to your dashboard to start training</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentSuccessComponent implements OnInit {

  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  subscription = signal<SubscriptionResponse | null>(null);
  isLoading = signal(true);
  error = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const subscriptionId = params['subscriptionId'];

      if (!subscriptionId) {
        this.error.set(true);
        this.isLoading.set(false);
        return;
      }

      this.loadSubscription(+subscriptionId);
    });
  }

  private loadSubscription(subscriptionId: number) {
    this.subscriptionService.getSubscriptionById(subscriptionId).subscribe({
      next: (res: any) => {
        this.subscription.set(res.data ?? res);
        this.isLoading.set(false);
      },
      error: err => {
        console.error(err);
        this.error.set(true);
        this.isLoading.set(false);
      }
    });
  }

  formatPrice(price?: number) {
    return price ? price.toFixed(2) : '0.00';
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  viewPackages() {
    this.router.navigate(['/packages']);
  }
}
