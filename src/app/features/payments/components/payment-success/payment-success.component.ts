import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SubscriptionService, SubscriptionResponse } from '../../../packages/services/subscription.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">

          <div class="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
            <h1 class="text-3xl font-bold text-white mb-2">Payment Approved!</h1>
            <p class="text-green-100" *ngIf="isProcessing()">Processing your payment...</p>
          </div>

          <div class="p-8">

            <div *ngIf="isProcessing()">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div class="flex items-center gap-4 mb-4">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <div>
                    <p class="font-semibold text-blue-900">Processing payment</p>
                    <p class="text-sm text-blue-700">Waiting for confirmation...</p>
                  </div>
                </div>
                <div class="w-full bg-blue-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all"
                    [style.width.%]="progressPercent()">
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!isProcessing() && subscription()">
              <div class="space-y-6">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p class="text-green-800 font-semibold">{{ subscription()?.packageName }} - Active</p>
                  <p class="text-sm text-green-700">Trainer: {{ subscription()?.trainerName }}</p>
                </div>

                <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p class="text-sm text-gray-600">Start Date</p>
                    <p class="font-semibold">{{ subscription()?.startDate | date }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">End Date</p>
                    <p class="font-semibold">{{ subscription()?.currentPeriodEnd | date }}</p>
                  </div>
                </div>

                <div class="border-t pt-4">
                  <p class="text-sm text-gray-600">Amount Paid</p>
                  <p class="text-3xl font-bold text-green-600">
                    $ {{ formatPrice(subscription()?.amountPaid) }}
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-4 pt-4 border-t">
                  <button
                    (click)="viewPackages()"
                    class="border-2 border-sky-600 text-sky-600 rounded-lg py-2 hover:bg-sky-50 transition">
                    View Packages
                  </button>
                  <button
                    (click)="goToDashboard()"
                    class="bg-sky-600 text-white rounded-lg py-2 hover:bg-sky-700 transition">
                    Dashboard
                  </button>
                </div>
              </div>
            </div>

            <div *ngIf="!isProcessing() && error()">
              <div class="text-center py-8">
                <h3 class="text-lg font-semibold text-red-600">Processing Timeout</h3>
                <p class="text-gray-500 mt-2">{{ errorMessage() }}</p>
                <button
                  (click)="goToDashboard()"
                  class="mt-4 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition">
                  Dashboard
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  subscription = signal<SubscriptionResponse | null>(null);
  isProcessing = signal(true);
  error = signal(false);
  errorMessage = signal('');
  progressPercent = signal(30);

  private pollAttempts = 0;
  private maxAttempts = 10;
  private pollInterval = 3000;

  ngOnInit() {
    setTimeout(() => {
      this.pollForActiveSubscription();
    }, this.pollInterval);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private pollForActiveSubscription() {
    this.subscriptionService.getMySubscriptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const subscriptions = response.data?.subscriptions || [];
          const activeSubscription = subscriptions.find(
            (s: any) => s.status === 'Active' || s.status === 'ACTIVE'
          );

          if (activeSubscription) {
            this.isProcessing.set(false);
            this.subscription.set(activeSubscription);
            this.progressPercent.set(100);

            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
          } else {
            this.retryPoll();
          }
        },
        error: () => this.retryPoll()
      });
  }

  private retryPoll() {
    this.pollAttempts++;
    this.progressPercent.set(
      Math.min(30 + (this.pollAttempts / this.maxAttempts) * 60, 90)
    );

    if (this.pollAttempts >= this.maxAttempts) {
      this.isProcessing.set(false);
      this.error.set(true);
      this.errorMessage.set(
        'Payment is confirmed but activation is taking longer than expected. Please check your dashboard.'
      );
    } else {
      setTimeout(() => {
        this.pollForActiveSubscription();
      }, this.pollInterval);
    }
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
