import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService, PaymentMethod, PaymentResponse } from '../../services/payment.service';
import { SubscriptionService, SubscriptionResponse } from '../../../packages/services/subscription.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Back Button -->
        <button
          (click)="goBack()"
          class="mb-6 flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back
        </button>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex justify-center items-center min-h-96">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        } @else if (subscription()) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Subscription Summary -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow-md p-8 mb-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
                <p class="text-gray-600 mb-6">Review your subscription details below</p>

                <!-- Order Summary -->
                <div class="border-b border-gray-200 pb-6 mb-6">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="w-16 h-16 bg-sky-100 rounded-lg flex items-center justify-center">
                      <svg class="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                      </svg>
                    </div>
                    <div>
                      <h2 class="text-xl font-semibold text-gray-900">{{ subscription()?.packageName }}</h2>
                      <p class="text-sm text-gray-600">By {{ subscription()?.trainerName }}</p>
                    </div>
                  </div>

                  <!-- Details -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm text-gray-600 mb-1">Duration</p>
                      <p class="font-semibold text-gray-900">
                        {{ subscription()?.isAnnual ? 'Yearly' : 'Monthly' }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 mb-1">Period</p>
                      <p class="font-semibold text-gray-900">
                        {{ subscription()?.daysRemaining }} days
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 mb-1">Start Date</p>
                      <p class="font-semibold text-gray-900">
                        {{ subscription()?.startDate | date: 'MMM dd, yyyy' }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 mb-1">End Date</p>
                      <p class="font-semibold text-gray-900">
                        {{ subscription()?.currentPeriodEnd | date: 'MMM dd, yyyy' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Payment Methods -->
                <div class="mb-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                  <div class="space-y-3">
                    <!-- PayPal -->
                    <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition"
                           [class]="selectedMethod() === 'PayPal' ? 'border-sky-600 bg-sky-50' : 'border-gray-200 hover:border-gray-300'">
                      <input
                        type="radio"
                        [value]="'PayPal'"
                        [(ngModel)]="selectedMethod"
                        [ngModelOptions]="{ updateOn: 'change' }"
                        class="w-4 h-4 text-sky-600" />
                      <div class="ml-3">
                        <p class="font-semibold text-gray-900">PayPal</p>
                        <p class="text-sm text-gray-600">Fast, secure, and widely accepted</p>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Info -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-sm text-blue-900">
                    ℹ️ You'll be redirected to PayPal to complete the payment securely.
                  </p>
                </div>
              </div>
            </div>

            <!-- Price Summary Card -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                <!-- Breakdown -->
                <div class="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-medium text-gray-900">{{ '$' }}{{ formatPrice(subscription()?.amountPaid) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Currency</span>
                    <span class="font-medium text-gray-900">{{ subscription()?.currency }}</span>
                  </div>
                </div>

                <!-- Total -->
                <div class="mb-6">
                  <div class="flex justify-between items-baseline">
                    <span class="text-xl font-semibold text-gray-900">Total</span>
                    <span class="text-3xl font-bold text-sky-600">{{ '$' }}{{ formatPrice(subscription()?.amountPaid) }}</span>
                  </div>
                </div>

                <!-- Pay Button -->
                <button
                  (click)="proceedToPayment()"
                  [disabled]="isProcessing() || !subscription()"
                  class="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition">
                  {{ isProcessing() ? 'Processing...' : 'Pay with PayPal' }}
                </button>

                <!-- Error Message -->
                @if (errorMessage()) {
                  <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-800 text-sm">⚠️ {{ errorMessage() }}</p>
                  </div>
                }

                <!-- Security -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                  <p class="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                    Secure Payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        } @else if (error()) {
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Subscription not found</h3>
            <p class="mt-2 text-gray-500">The subscription you're trying to pay for doesn't exist.</p>
            <button
              (click)="goBack()"
              class="mt-4 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition">
              Back
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class PaymentComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private subscriptionService = inject(SubscriptionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  subscriptionId!: number;
  subscription = signal<SubscriptionResponse | null>(null);
  isLoading = signal(false);
  isProcessing = signal(false);
  error = signal(false);
  errorMessage = signal('');
  selectedMethod = signal<string>('PayPal');

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.subscriptionId = parseInt(params['id'], 10);
      if (this.subscriptionId) {
        this.loadSubscription();
      }
    });
  }

  private loadSubscription() {
    this.isLoading.set(true);
    this.subscriptionService.getSubscriptionById(this.subscriptionId).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.subscription.set(response.data);
        } else {
          this.subscription.set(response);
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading subscription:', err);
        this.error.set(true);
        this.isLoading.set(false);
      }
    });
  }

  proceedToPayment() {
    if (!this.subscription()) return;

    this.isProcessing.set(true);
    this.errorMessage.set('');

    // PayPal will redirect to backend /api/payment/paypal/return with token
    // Backend will handle capture and redirect to success/failed page
    const request = {
      subscriptionId: this.subscriptionId,
      paymentMethod: this.selectedMethod()
    };

    this.paymentService.initiatePayment(request).subscribe({
      next: (response: any) => {
        const paymentUrl = response.data?.paymentUrl || response.paymentUrl;
        if (paymentUrl) {
          // Redirect to PayPal approval URL
          // PayPal will callback to backend /api/payment/paypal/return with token
          window.location.href = paymentUrl;
        } else {
          this.errorMessage.set('Failed to get payment URL. Please try again.');
          this.isProcessing.set(false);
        }
      },
      error: (err: any) => {
        console.error('Error initiating payment:', err);
        this.errorMessage.set(err.error?.message || 'Failed to initiate payment. Please try again.');
        this.isProcessing.set(false);
      }
    });
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '0.00';
    return price.toFixed(2);
  }

  goBack() {
    this.router.navigate(['/packages']);
  }
}
