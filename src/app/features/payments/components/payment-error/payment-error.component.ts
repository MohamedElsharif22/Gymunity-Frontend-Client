import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-error',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Error Card -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <!-- Icon Section -->
          <div class="bg-gradient-to-r from-red-500 to-pink-500 p-8 text-center">
            <div class="flex justify-center mb-4">
              <div class="bg-white rounded-full p-3">
                <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Payment Error</h1>
            <p class="text-red-100">Something went wrong with your payment</p>
          </div>

          <!-- Content Section -->
          <div class="p-8">
            <div class="space-y-6">
              <!-- Message -->
              <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p class="text-red-800">
                  <strong>Unexpected Error:</strong> An unexpected error occurred while processing your payment. Your subscription has not been activated.
                </p>
              </div>

              <!-- Info -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 class="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>No charge has been made to your account</li>
                  <li>Your subscription is still in pending status</li>
                  <li>You can try the payment process again</li>
                  <li>Contact support if this persists</li>
                </ul>
              </div>

              <!-- Action Buttons -->
              <div class="grid grid-cols-2 gap-4 pt-4 border-t">
                <button
                  (click)="retryPayment()"
                  class="py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Try Again
                </button>
                <button
                  (click)="viewPackages()"
                  class="py-3 px-4 border-2 border-sky-600 text-sky-600 font-semibold rounded-lg hover:bg-sky-50 transition">
                  Back to Packages
                </button>
              </div>

              <!-- Support -->
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <p class="text-sm text-amber-800">
                  <strong>Need help?</strong>
                  <a href="mailto:support@gymunity.com" class="underline hover:no-underline font-semibold">Contact our support team</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentErrorComponent {
  private router = inject(Router);

  retryPayment() {
    // Navigate back to packages to restart subscription
    this.router.navigate(['/packages']);
  }

  viewPackages() {
    this.router.navigate(['/packages']);
  }
}
