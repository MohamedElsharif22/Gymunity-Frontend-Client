import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Error Card -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <!-- Icon Section -->
          <div class="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center">
            <div class="flex justify-center mb-4">
              <div class="bg-white rounded-full p-3">
                <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Payment Failed</h1>
            <p class="text-red-100">Your payment could not be processed</p>
          </div>

          <!-- Content Section -->
          <div class="p-8">
            <div class="space-y-6">
              <!-- Message -->
              <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p class="text-red-800">
                  <strong>What happened?</strong> There was an issue processing your payment. Your subscription has not been activated.
                </p>
              </div>

              <!-- Tips -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">What you can do</h3>
                <ul class="space-y-3">
                  <li class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-gray-700">Check that your payment details are correct</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-gray-700">Ensure you have sufficient funds</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-gray-700">Try again with a different payment method</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-gray-700">Contact support if the problem persists</span>
                  </li>
                </ul>
              </div>

              <!-- Action Buttons -->
              <div class="grid grid-cols-2 gap-4 pt-4 border-t">
                <button
                  (click)="goBack()"
                  class="py-2 px-4 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition">
                  Try Again
                </button>
                <button
                  (click)="goToDashboard()"
                  class="py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition">
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentFailedComponent {
  private router = inject(Router);

  goBack() {
    this.router.navigate(['/packages']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
