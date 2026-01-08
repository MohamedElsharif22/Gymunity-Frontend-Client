import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { PaymentGatewayService } from '../../services/payment-gateway.service';
import { SubscriptionService, SubscriptionResponse } from '../../../packages/services/subscription.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Back Button -->
        <button
          (click)="goBack()"
          class="mb-8 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Packages
        </button>

        <!-- Page Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-3">Complete Your Payment</h1>
          <p class="text-xl text-gray-600">Choose your preferred payment method to activate your subscription</p>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Checkout Form -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Loading State -->
            @if (isLoading()) {
              <div class="bg-white rounded-xl shadow-lg p-12 flex justify-center items-center min-h-96">
                <div class="text-center">
                  <div class="inline-flex justify-center items-center w-16 h-16 mb-4">
                    <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
                  </div>
                  <p class="text-gray-600 font-medium">Loading subscription details...</p>
                </div>
              </div>
            } @else if (error()) {
              <!-- Error State -->
              <div class="bg-white rounded-xl shadow-lg p-8">
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Subscription Not Found</h3>
                    <p class="text-gray-600 mb-4">The subscription you're trying to pay for doesn't exist or has been removed.</p>
                    <button
                      (click)="goBack()"
                      class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                      Back to Packages
                    </button>
                  </div>
                </div>
              </div>
            } @else if (subscription()) {
              <!-- Payment Method Selection -->
              <div class="bg-white rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Select Payment Method</h2>

                <!-- Payment Method Options -->
                <div class="space-y-3">
                  <!-- Stripe Option -->
                  <label
                    class="relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition"
                    [class]="selectedMethod() === PaymentMethod.Stripe
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white'">
                    <input
                      type="radio"
                      name="paymentMethod"
                      [value]="PaymentMethod.Stripe"
                      [checked]="selectedMethod() === PaymentMethod.Stripe"
                      (change)="selectedMethod.set(PaymentMethod.Stripe)"
                      class="mt-1 h-4 w-4 text-blue-600 cursor-pointer" />
                    <div class="ml-4 flex-1">
                      <div class="flex items-center justify-between">
                        <p class="text-lg font-semibold text-gray-900">Credit Card</p>
                        <svg class="h-8 w-auto text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                          <path
                            d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9h8.01v1H9.89zm0-5h7.92v1H9.89zm6.3-5H9.89v1h6.3zm2.8 11c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
                        </svg>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">Secure payment powered by Stripe</p>
                      <p class="text-xs text-gray-500 mt-2">✓ Visa, Mastercard, American Express, and more</p>
                    </div>
                  </label>

                  <!-- PayPal Option -->
                  <label
                    class="relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition"
                    [class]="selectedMethod() === PaymentMethod.PayPal
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white'">
                    <input
                      type="radio"
                      name="paymentMethod"
                      [value]="PaymentMethod.PayPal"
                      [checked]="selectedMethod() === PaymentMethod.PayPal"
                      (change)="selectedMethod.set(PaymentMethod.PayPal)"
                      class="mt-1 h-4 w-4 text-blue-600 cursor-pointer" />
                    <div class="ml-4 flex-1">
                      <div class="flex items-center justify-between">
                        <p class="text-lg font-semibold text-gray-900">PayPal</p>
                        <svg class="h-8 w-auto" viewBox="0 0 24 24">
                          <path fill="#003087" d="M9.5 8c0 .5-.5 1-1 1H7c-.5 0-1-.5-1-1V7c0-.5.5-1 1-1h1.5c.5 0 1 .5 1 1v1z" />
                          <path fill="#009be1" d="M17 8c0 .5-.5 1-1 1h-1.5c-.5 0-1-.5-1-1V7c0-.5.5-1 1-1H16c.5 0 1 .5 1 1v1z" />
                        </svg>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">Pay with your PayPal account</p>
                      <p class="text-xs text-gray-500 mt-2">✓ Fast checkout with saved payment methods</p>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Security Note -->
              <div class="bg-green-50 border border-green-200 rounded-xl p-6 flex gap-4">
                <svg class="h-6 w-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clip-rule="evenodd" />
                </svg>
                <div>
                  <p class="font-semibold text-green-900">Your payment is secure</p>
                  <p class="text-sm text-green-700 mt-1">All payments are encrypted and processed securely by our payment partners.</p>
                </div>
              </div>
            }
          </div>

          <!-- Right Column: Order Summary -->
          @if (subscription() && !isLoading() && !error()) {
            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl shadow-lg p-8 sticky top-32">
                <h3 class="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                <!-- Subscription Details -->
                <div class="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <!-- Package -->
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Package</p>
                    <p class="font-semibold text-gray-900">{{ subscription()!.packageName }}</p>
                  </div>

                  <!-- Trainer -->
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Trainer</p>
                    <p class="font-semibold text-gray-900">{{ subscription()!.trainerName }}</p>
                  </div>

                  <!-- Duration -->
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Duration</p>
                    <p class="font-semibold text-gray-900">{{ subscription()!.isAnnual ? 'Yearly' : 'Monthly' }}</p>
                  </div>

                  <!-- Period -->
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Valid Period</p>
                    <p class="font-semibold text-gray-900 text-sm">
                      {{ subscription()!.startDate | date: 'MMM dd, yyyy' }} -
                      {{ subscription()!.currentPeriodEnd | date: 'MMM dd, yyyy' }}
                    </p>
                  </div>
                </div>

                <!-- Price Breakdown -->
                <div class="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div class="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span class="font-medium">{{ '$' }}{{ formatPrice(subscription()!.amountPaid) }}</span>
                  </div>
                  <div class="flex justify-between text-gray-600">
                    <span>Taxes & Fees</span>
                    <span class="font-medium">{{ '$' }}0.00</span>
                  </div>
                </div>

                <!-- Total -->
                <div class="mb-8">
                  <div class="flex justify-between items-baseline">
                    <span class="text-lg font-semibold text-gray-900">Total</span>
                    <span class="text-3xl font-bold text-blue-600">{{ '$' }}{{ formatPrice(subscription()!.amountPaid) }}</span>
                  </div>
                  <p class="text-sm text-gray-500 mt-2">{{ subscription()!.currency }}</p>
                </div>

                <!-- Pay Button -->
                <button
                  (click)="proceedToPayment()"
                  [disabled]="isProcessing()"
                  class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2">
                  @if (isProcessing()) {
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    <span>Processing...</span>
                  } @else {
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clip-rule="evenodd" />
                    </svg>
                    <span>Proceed to Payment</span>
                  }
                </button>

                <!-- Error Message -->
                @if (errorMessage()) {
                  <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-800 text-sm font-medium">{{ errorMessage() }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly paymentGatewayService = inject(PaymentGatewayService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  subscriptionId!: number;
  subscription = signal<SubscriptionResponse | null>(null);
  isLoading = signal(false);
  isProcessing = signal(false);
  error = signal(false);
  errorMessage = signal('');
  selectedMethod = signal<number>(2); // 2 = Stripe by default

  // Enums for template
  PaymentMethod = { Stripe: 2, PayPal: 1 };

  // Form
  paymentForm!: FormGroup;

  ngOnInit() {
    this.paymentForm = this.fb.group({
      paymentMethod: [2, Validators.required]
    });

    this.route.params.subscribe(params => {
      this.subscriptionId = parseInt(params['id'], 10);
      if (this.subscriptionId) {
        this.loadSubscription();
      }
    });
  }

  private loadSubscription() {
    this.isLoading.set(true);
    this.error.set(false);
    this.subscriptionService.getSubscriptionById(this.subscriptionId).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.subscription.set(data);
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

    this.paymentService.initiatePayment(this.subscriptionId, this.selectedMethod()).subscribe({
      next: (response: any) => {
        const paymentUrl = response.data?.paymentUrl || response.paymentUrl;
        if (paymentUrl) {
          // Redirect to Stripe or PayPal checkout
          this.paymentGatewayService.redirectToCheckout(paymentUrl);
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
