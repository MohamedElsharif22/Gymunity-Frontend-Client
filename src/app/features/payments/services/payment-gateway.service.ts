import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Payment Gateway Service
 * Handles checkout redirects and payment returns for Stripe and PayPal
 * Both payment methods return hosted checkout URLs for seamless UX
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentGatewayService {
  private readonly router = inject(Router);

  /**
   * Redirect user to payment gateway checkout
   * @param paymentUrl - The hosted checkout URL from Stripe or PayPal
   * @throws Error if payment URL is invalid
   */
  redirectToCheckout(paymentUrl: string): void {
    if (!paymentUrl || paymentUrl.trim() === '') {
      console.error('Invalid payment URL provided');
      throw new Error('Payment URL is required for checkout redirect');
    }

    console.log('Redirecting to checkout:', paymentUrl);
    // Direct redirect to hosted checkout page
    window.location.href = paymentUrl;
  }

  /**
   * Handle successful payment return
   * Navigates to payment return component with subscription context
   * Both Stripe and PayPal redirect to /payment/return with query params
   * @param params - Return parameters from payment gateway
   */
  handlePaymentReturn(params: any): void {
    const subscriptionId = params['subscriptionId'];

    if (!subscriptionId) {
      console.error('No subscription ID in return parameters');
      this.router.navigate(['/dashboard'], {
        queryParams: { error: 'Invalid return parameters' }
      });
      return;
    }

    console.log('Handling payment return for subscription:', subscriptionId);
    // Navigate to payment return component with all params
    this.router.navigate(['/payments/return'], {
      queryParams: params
    });
  }

  /**
   * Handle payment cancellation
   * Navigates to cancellation page for retry
   * @param subscriptionId - The subscription ID for the cancelled payment
   */
  handlePaymentCancel(subscriptionId: number): void {
    console.log('Payment cancelled for subscription:', subscriptionId);
    this.router.navigate(['/payments/cancel'], {
      queryParams: { subscriptionId }
    });
  }

  /**
   * Determine payment gateway from checkout URL
   * Used for analytics and logging
   * @param url - The payment gateway checkout URL
   * @returns The detected payment method
   */
  getPaymentMethodFromUrl(url: string): 'stripe' | 'paypal' | 'unknown' {
    if (!url) return 'unknown';

    if (url.includes('checkout.stripe.com')) {
      return 'stripe';
    } else if (url.includes('paypal.com')) {
      return 'paypal';
    }

    return 'unknown';
  }

  /**
   * Build return URL for payment gateway redirect
   * Used by backend to know where to send user after payment
   * @param path - Optional custom path for return (default: /payments/return)
   * @returns Full return URL
   */
  buildReturnUrl(path: string = '/payments/return'): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}${path}`;
  }

  /**
   * Build cancel URL for payment gateway redirect
   * Used by backend to know where to send user if they cancel
   * @param subscriptionId - The subscription ID
   * @returns Full cancel URL with query params
   */
  buildCancelUrl(subscriptionId: number): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/payments/cancel?subscriptionId=${subscriptionId}`;
  }
}
