import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { SubscriptionService } from '../../../packages/services/subscription.service';
import { interval, Subject, Subscription } from 'rxjs';
import { takeUntil, switchMap, take } from 'rxjs/operators';

/**
 * Payment Return Component
 * Handles post-payment status after user returns from Stripe or PayPal checkout
 * Features:
 * - Polls payment status from backend
 * - Displays success, failure, or pending states
 * - Allows retry or navigation to dashboard
 * - Handles webhook processing delays
 */
@Component({
  selector: 'app-payment-return',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto">
        <!-- Loading State -->
        @if (isLoading()) {
          <div class="bg-white rounded-xl shadow-lg p-12 text-center">
            <div class="inline-flex justify-center items-center w-20 h-20 mb-6 bg-blue-100 rounded-full">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">Processing Your Payment</h2>
            <p class="text-gray-600 mb-4">Please wait while we confirm your payment...</p>
            <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                [style.width.%]="progressPercent()"></div>
            </div>
            <p class="text-sm text-gray-500">{{ processingMessage() }}</p>
          </div>
        }

        <!-- Success State -->
        @if (!isLoading() && paymentStatus() === 'success') {
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <!-- Success Header -->
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
              <div class="inline-flex justify-center items-center w-20 h-20 mb-6 bg-white/20 rounded-full">
                <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <h1 class="text-3xl font-bold mb-2">Payment Approved!</h1>
              <p class="text-green-100">Your subscription is now active</p>
            </div>

            <!-- Success Content -->
            <div class="p-8 space-y-6">
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <p class="text-green-800 font-medium">✓ Your payment has been successfully processed</p>
              </div>

              <!-- Subscription Details -->
              @if (subscriptionDetails()) {
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
                  <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p class="text-sm text-gray-600 mb-1">Package</p>
                      <p class="font-semibold text-gray-900">{{ subscriptionDetails()!.packageName }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 mb-1">Trainer</p>
                      <p class="font-semibold text-gray-900">{{ subscriptionDetails()!.trainerName }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 mb-1">Start Date</p>
                      <p class="font-semibold text-gray-900">{{ subscriptionDetails()!.startDate | date: 'MMM dd, yyyy' }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 mb-1">End Date</p>
                      <p class="font-semibold text-gray-900">{{ subscriptionDetails()!.currentPeriodEnd | date: 'MMM dd, yyyy' }}</p>
                    </div>
                    <div class="col-span-2">
                      <p class="text-sm text-gray-600 mb-1">Amount Paid</p>
                      <p class="text-2xl font-bold text-green-600">{{ '$' }}{{ formatPrice(subscriptionDetails()!.amountPaid) }}</p>
                    </div>
                  </div>
                </div>
              }

              <!-- Confirmation Email -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <svg class="h-6 w-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path
                    d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div>
                  <p class="font-medium text-blue-900">Confirmation email sent</p>
                  <p class="text-sm text-blue-700">We've sent a receipt to your email address</p>
                </div>
              </div>

              <!-- Action Button -->
              <button
                (click)="goToDashboard()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Go to Dashboard
              </button>
            </div>
          </div>
        }

        <!-- Failed State -->
        @if (!isLoading() && paymentStatus() === 'failed') {
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <!-- Error Header -->
            <div class="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center text-white">
              <div class="inline-flex justify-center items-center w-20 h-20 mb-6 bg-white/20 rounded-full">
                <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <h1 class="text-3xl font-bold mb-2">Payment Failed</h1>
              <p class="text-red-100">Your payment could not be processed</p>
            </div>

            <!-- Error Content -->
            <div class="p-8 space-y-6">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800 font-medium">{{ errorMessage() }}</p>
              </div>

              <!-- Retry Actions -->
              <div class="grid grid-cols-2 gap-4">
                <button
                  (click)="retryPayment()"
                  class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7 7 0 015.02-1.9c3.897 0 7.327 2.882 7.9 6.659a.75.75 0 10-1.488.12 5.5 5.5 0 10-9.712 3.172.75.75 0 11-1.06 1.061 7 7 0 1111.618-4.868A7.001 7.001 0 0110 5c-3.868 0-7.088 2.678-7.81 6.153A.75.75 0 010 11.049V4a1 1 0 011-1h3z"
                      clip-rule="evenodd" />
                  </svg>
                  Try Again
                </button>
                <button
                  (click)="goToDashboard()"
                  class="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Dashboard
                </button>
              </div>

              <!-- Support -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p class="text-sm text-blue-900">
                  Need help?
                  <a href="mailto:support@gymunity.com" class="font-semibold text-blue-600 hover:text-blue-700">Contact support</a>
                </p>
              </div>
            </div>
          </div>
        }

        <!-- Pending State -->
        @if (!isLoading() && paymentStatus() === 'pending') {
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <!-- Pending Header -->
            <div class="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-center text-white">
              <div class="inline-flex justify-center items-center w-20 h-20 mb-6 bg-white/20 rounded-full">
                <svg class="h-12 w-12 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <h1 class="text-3xl font-bold mb-2">Payment Processing</h1>
              <p class="text-amber-100">This typically takes a few moments</p>
            </div>

            <!-- Pending Content -->
            <div class="p-8 space-y-6">
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <svg class="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
                <div>
                  <p class="font-medium text-amber-900">Your payment is still being verified</p>
                  <p class="text-sm text-amber-700 mt-1">We'll send you a confirmation email once it's complete.</p>
                </div>
              </div>

              <!-- Action Button -->
              <button
                (click)="goToDashboard()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Go to Dashboard
              </button>
            </div>
          </div>
        }

        <!-- Unknown State -->
        @if (!isLoading() && paymentStatus() === 'unknown') {
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <!-- Unknown Header -->
            <div class="bg-gradient-to-r from-gray-500 to-gray-600 p-8 text-center text-white">
              <div class="inline-flex justify-center items-center w-20 h-20 mb-6 bg-white/20 rounded-full">
                <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 100-2 1 1 0 000 2zM10 6a1 1 0 100-2 1 1 0 000 2zM13 6a1 1 0 100-2 1 1 0 000 2z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <h1 class="text-3xl font-bold mb-2">Payment Status Unknown</h1>
              <p class="text-gray-100">We couldn't determine your payment status</p>
            </div>

            <!-- Unknown Content -->
            <div class="p-8 space-y-6">
              <p class="text-gray-600">Please try again or contact support for assistance.</p>

              <!-- Action Buttons -->
              <div class="grid grid-cols-2 gap-4">
                <button
                  (click)="retryPayment()"
                  class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7 7 0 015.02-1.9c3.897 0 7.327 2.882 7.9 6.659a.75.75 0 10-1.488.12 5.5 5.5 0 10-9.712 3.172.75.75 0 11-1.06 1.061 7 7 0 1111.618-4.868A7.001 7.001 0 0110 5c-3.868 0-7.088 2.678-7.81 6.153A.75.75 0 010 11.049V4a1 1 0 011-1h3z"
                      clip-rule="evenodd" />
                  </svg>
                  Try Again
                </button>
                <button
                  (click)="goToDashboard()"
                  class="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class PaymentReturnComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly destroy$ = new Subject<void>();

  // State Signals
  isLoading = signal(true);
  paymentStatus = signal<'success' | 'failed' | 'pending' | 'unknown'>('unknown');
  subscriptionDetails = signal<any>(null);
  errorMessage = signal('');
  progressPercent = signal(30);
  processingMessage = signal('Processing your payment...');

  // Polling variables
  private pollCount = 0;
  private maxPolls = 5;
  private pollInterval = 1000;
  private pollSubscription: Subscription | null = null;

  subscriptionId: number = 0;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.subscriptionId = parseInt(params['subscriptionId'], 10);
      console.log('Payment return component initialized with subscriptionId:', this.subscriptionId);

      if (!this.subscriptionId || isNaN(this.subscriptionId)) {
        console.error('Invalid subscription ID:', params['subscriptionId']);
        this.paymentStatus.set('failed');
        this.errorMessage.set('No subscription ID provided');
        this.isLoading.set(false);
        return;
      }

      // Start polling for payment status
      console.log('Starting payment status polling...');
      this.pollPaymentStatus();
    });
  }

  /**
   * Poll payment status from backend
   * The backend processes webhook and updates payment status
   * Checks subscription status directly for faster response
   */
  private pollPaymentStatus(): void {
    this.pollSubscription = interval(this.pollInterval)
      .pipe(
        take(this.maxPolls),
        switchMap(() => this.subscriptionService.getSubscriptionById(this.subscriptionId))
      )
      .subscribe({
        next: (response: any) => {
          this.pollCount++;
          console.log(`Poll ${this.pollCount}/${this.maxPolls}:`, response);
          this.progressPercent.set(30 + (this.pollCount * 70) / this.maxPolls);

          const subscription = response.data || response;
          console.log('Subscription data:', subscription);
          console.log('Subscription status:', subscription?.status);

          if (subscription && subscription.status === 'Active') {
            // Payment successful - subscription is active
            console.log('Payment confirmed! Subscription is Active');
            this.paymentStatus.set('success');
            this.subscriptionDetails.set(subscription);
            this.isLoading.set(false);
            this.pollSubscription?.unsubscribe();
          } else if (this.pollCount >= this.maxPolls) {
            // Timeout - still processing or failed
            console.log('Max polls reached, subscription status:', subscription?.status);
            if (subscription && subscription.status === 'Unpaid') {
              this.paymentStatus.set('pending');
              this.processingMessage.set('Almost done...');
            } else {
              this.paymentStatus.set('pending');
            }
            this.isLoading.set(false);
            this.pollSubscription?.unsubscribe();
          } else {
            this.updateProgressMessage();
          }
        },
        error: (error: any) => {
          console.error('Payment status polling error:', error);
          // Show pending state on error
          this.paymentStatus.set('pending');
          this.processingMessage.set('Verifying payment status...');
          this.isLoading.set(false);
        },
        complete: () => {
          console.log('Polling completed');
          // If still loading after polling completes, show pending
          if (this.isLoading()) {
            this.paymentStatus.set('pending');
            this.isLoading.set(false);
          }
        }
      });
  }

  /**
   * Update progress message during polling
   */
  private updateProgressMessage(): void {
    const messages = [
      'Processing your payment...',
      'Verifying with payment provider...',
      'Confirming transaction...',
      'Almost done...'
    ];
    const index = Math.floor((this.pollCount / this.maxPolls) * messages.length);
    this.processingMessage.set(messages[Math.min(index, messages.length - 1)]);
  }

  /**
   * Load subscription details for display
   */
  private loadSubscriptionDetails(): void {
    this.subscriptionService.getSubscriptionById(this.subscriptionId).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.subscriptionDetails.set(data);
      },
      error: (err: any) => {
        console.error('Error loading subscription details:', err);
      }
    });
  }

  /**
   * Retry payment
   */
  retryPayment(): void {
    this.router.navigate(['/payments/checkout'], {
      queryParams: { subscriptionId: this.subscriptionId }
    });
  }

  /**
   * Navigate to dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Format price for display
   */
  formatPrice(price: number | undefined): string {
    if (!price) return '0.00';
    return price.toFixed(2);
  }

  ngOnDestroy(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
