import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Payment Cancel Component
 * Displayed when user cancels payment at Stripe or PayPal checkout
 * Allows user to retry or return to dashboard
 */
@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto">
        <!-- Cancel Card -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- Cancel Header -->
          <div class="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-center text-white">
            <div class="inline-flex justify-center items-center w-20 h-20 mb-6 bg-white/20 rounded-full">
              <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <h1 class="text-3xl font-bold mb-2">Payment Cancelled</h1>
            <p class="text-amber-100">No charges were made to your account</p>
          </div>

          <!-- Cancel Content -->
          <div class="p-8 space-y-6">
            <!-- Info Message -->
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p class="text-amber-800 font-medium">You cancelled the payment process</p>
              <p class="text-sm text-amber-700 mt-1">You can restart anytime you're ready to complete your subscription.</p>
            </div>

            <!-- What Happens Now -->
            <div class="space-y-3">
              <h3 class="text-lg font-semibold text-gray-900">What happens now?</h3>
              <ul class="space-y-2 text-gray-600">
                <li class="flex gap-3">
                  <svg class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>No charges were applied to your payment method</span>
                </li>
                <li class="flex gap-3">
                  <svg class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Your subscription is not yet active</span>
                </li>
                <li class="flex gap-3">
                  <svg class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>You can try again whenever you're ready</span>
                </li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-4 pt-4">
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
                Go to Dashboard
              </button>
            </div>

            <!-- FAQ -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Frequently Asked Questions</h4>
              <div class="space-y-3">
                <div>
                  <p class="font-medium text-gray-900 text-sm">Why was my payment cancelled?</p>
                  <p class="text-sm text-gray-600 mt-1">You clicked cancel during the payment process. No transaction was completed.</p>
                </div>
                <div>
                  <p class="font-medium text-gray-900 text-sm">When can I try again?</p>
                  <p class="text-sm text-gray-600 mt-1">You can restart the payment process immediately. Click "Try Again" to proceed.</p>
                </div>
                <div>
                  <p class="font-medium text-gray-900 text-sm">Do I lose my subscription?</p>
                  <p class="text-sm text-gray-600 mt-1">Your subscription hasn't started yet, so there's nothing to lose. Complete payment to activate it.</p>
                </div>
              </div>
            </div>

            <!-- Support -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p class="text-sm text-blue-900">
                Having trouble?
                <a href="mailto:support@gymunity.com" class="font-semibold text-blue-600 hover:text-blue-700">Contact our support team</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentCancelComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  subscriptionId = signal(0);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.subscriptionId.set(parseInt(params['subscriptionId'], 10));
    });
  }

  /**
   * Retry payment by navigating back to checkout
   */
  retryPayment(): void {
    this.router.navigate(['/payments/checkout'], {
      queryParams: { subscriptionId: this.subscriptionId() }
    });
  }

  /**
   * Navigate to dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
