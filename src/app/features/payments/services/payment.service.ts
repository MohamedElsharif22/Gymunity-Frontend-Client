import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import {
  PaymentResponse,
  InitiatePaymentRequest,
  PaymentMethod,
  PaymentStatus
} from '../../../core/models/payment.model';

/**
 * API Response wrapper for payment endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errorMessage?: string;
  message?: string;
}

/**
 * Payment history response wrapper
 */
export interface PaymentHistoryResponse {
  success?: boolean;
  data?: {
    totalPayments: number;
    totalAmount: number;
    payments: PaymentResponse[];
  };
  payments?: PaymentResponse[];
  totalPayments?: number;
  totalAmount?: number;
}

/**
 * Payment Service
 * Handles all payment-related API calls for Stripe and PayPal
 * Supports initiating payments, fetching payment history, and getting payment details
 *
 * @example
 * // Initiate Stripe payment
 * this.paymentService.initiatePayment(subscriptionId, PaymentMethod.Stripe)
 *   .subscribe(response => {
 *     window.location.href = response.data.paymentUrl;
 *   });
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiService = inject(ApiService);
  private readonly baseUrl = '/api/client/payments';

  /**
   * Initiate payment for a subscription
   * Supports both Stripe Checkout Sessions and PayPal
   * Backend returns hosted checkout URL for seamless payment experience
   *
   * @param subscriptionId - The subscription ID to pay for
   * @param paymentMethod - The payment method (Stripe or PayPal)
   * @returns Observable of PaymentResponse with checkout URL
   * @throws Error with message if initiation fails
   */
  initiatePayment(
    subscriptionId: number,
    paymentMethod: PaymentMethod
  ): Observable<ApiResponse<PaymentResponse>> {
    const request: InitiatePaymentRequest = {
      subscriptionId,
      paymentMethod,
      returnUrl: this.getReturnUrl(subscriptionId)
    };

    return this.apiService.post<ApiResponse<PaymentResponse>>(
      `${this.baseUrl}/initiate`,
      request
    ).pipe(
      tap(response => {
        if (response.success && response.data?.paymentUrl) {
          console.log(
            'Payment initiated successfully',
            this.getPaymentMethodName(paymentMethod),
            response.data
          );
        }
      }),
      catchError(error => this.handleError(error, 'initiate'))
    );
  }

  /**
   * Get payment history for current user
   * Optionally filter by status
   *
   * @param status - Optional payment status to filter by
   * @returns Observable of payment history
   */
  getPaymentHistory(
    status?: PaymentStatus
  ): Observable<PaymentHistoryResponse> {
    let url = `${this.baseUrl}`;

    if (status !== undefined) {
      url += `?status=${status}`;
    }

    return this.apiService.get<PaymentHistoryResponse>(url).pipe(
      tap(response => {
        console.log('Payment history retrieved', response);
      }),
      catchError(error => this.handleError(error, 'getPaymentHistory'))
    );
  }

  /**
   * Get payment details by ID
   * Retrieves comprehensive payment information
   *
   * @param paymentId - The payment ID
   * @returns Observable of PaymentResponse
   */
  getPaymentById(paymentId: number): Observable<PaymentResponse> {
    return this.apiService
      .get<PaymentResponse>(`${this.baseUrl}/${paymentId}`)
      .pipe(
        tap(response => {
          console.log('Payment retrieved', response);
        }),
        catchError(error => this.handleError(error, 'getPaymentById'))
      );
  }

  /**
   * Get payment status by ID
   * Useful for polling payment status during checkout
   *
   * @param paymentId - The payment ID
   * @returns Observable of payment status
   */
  getPaymentStatus(paymentId: number): Observable<{ status: PaymentStatus }> {
    return this.apiService
      .get<{ status: PaymentStatus }>(`${this.baseUrl}/${paymentId}/status`)
      .pipe(
        catchError(error => this.handleError(error, 'getPaymentStatus'))
      );
  }

  /**
   * Build return URL for payment gateway
   * Called after user completes/cancels payment in Stripe or PayPal
   * Both gateways redirect to this URL with query parameters
   *
   * @param subscriptionId - The subscription ID to include in the return URL
   * @returns Full return URL with subscription ID
   */
  private getReturnUrl(subscriptionId: number): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/payments/return?subscriptionId=${subscriptionId}`;
  }

  /**
   * Get payment method display name
   * Used for logging and user messages
   *
   * @param method - The payment method enum
   * @returns Display name
   */
  private getPaymentMethodName(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.Stripe:
        return 'Stripe';
      case PaymentMethod.PayPal:
        return 'PayPal';
      case PaymentMethod.Paymob:
        return 'Paymob';
      default:
        return 'Unknown';
    }
  }

  /**
   * Handle HTTP errors from payment API
   * Transforms backend errors into user-friendly messages
   *
   * @param error - The HTTP error response
   * @param operation - The operation that failed (for logging)
   * @returns Observable error with formatted message
   */
  private handleError(error: any, operation: string = 'operation') {
    console.error(`Payment service error [${operation}]:`, error);

    let errorMessage = 'Payment request failed. Please try again.';

    if (error.error?.errorMessage) {
      errorMessage = error.error.errorMessage;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 401) {
      errorMessage = 'You are not authenticated. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'Subscription not found.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid payment request. Please check your details.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error
    }));
  }
}

