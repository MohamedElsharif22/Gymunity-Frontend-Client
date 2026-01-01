import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-canceled',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Canceled Card -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <!-- Icon Section -->
          <div class="bg-gradient-to-r from-amber-500 to-yellow-500 p-8 text-center">
            <div class="flex justify-center mb-4">
              <div class="bg-white rounded-full p-3">
                <svg class="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Payment Canceled</h1>
            <p class="text-amber-100">You canceled the payment process</p>
          </div>

          <!-- Content Section -->
          <div class="p-8">
            <div class="space-y-6">
              <!-- Message -->
              <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <p class="text-amber-800">
                  Your payment was not completed. Your subscription has not been activated and you have not been charged.
                </p>
              </div>

              <!-- Info -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
                <ul class="space-y-2 text-gray-700">
                  <li>• Your pending subscription remains saved</li>
                  <li>• You can resume payment anytime</li>
                  <li>• No charges were applied</li>
                </ul>
              </div>

              <!-- Action Buttons -->
              <div class="grid grid-cols-2 gap-4 pt-4 border-t">
                <button
                  (click)="continuePayment()"
                  class="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition">
                  Continue Payment
                </button>
                <button
                  (click)="goToDashboard()"
                  class="py-2 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition">
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Help Section -->
        <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="font-semibold text-blue-900 mb-2">Need help?</h3>
          <p class="text-sm text-blue-800 mb-3">
            If you have any questions about your subscription or payment, please contact our support team.
          </p>
          <button
            (click)="goToSupport()"
            class="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentCanceledComponent {
  private router = inject(Router);

  continuePayment() {
    this.router.navigate(['/packages']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToSupport() {
    // Navigate to support page or open contact form
    this.router.navigate(['/support']);
  }
}
