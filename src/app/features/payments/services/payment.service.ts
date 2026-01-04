import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export enum PaymentMethod {
  PayPal = 'PayPal',
  CreditCard = 'CreditCard',
  ApplePay = 'ApplePay'
}

export interface InitiatePaymentRequest {
  subscriptionId: number;
  paymentMethod: PaymentMethod | string;
  returnUrl?: string;
}

export interface PaymentResponse {
  id: number;
  subscriptionId: number;
  amount: number;
  currency: string;
  status: string; // Pending, Processing, Completed, Failed
  method: string; // PayPal, CreditCard
  createdAt: Date;
  paidAt?: Date;
  failureReason?: string;
  paymentUrl?: string;
  transactionId?: string;
}

export interface PaymentHistoryResponse {
  totalPayments: number;
  totalAmount: number;
  payments: PaymentResponse[];
}

/**
 * Payment Service
 * Handles all payment-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiService = inject(ApiService);

  /**
   * Initiate payment for a subscription
   */
  // initiatePayment(request: InitiatePaymentRequest): Observable<PaymentResponse> {
  //   return this.apiService.post<PaymentResponse>(
  //     '/api/client/payments/initiate',
  //     request
  //   );
  // }
initiatePayment(
  request: InitiatePaymentRequest
): Observable<{ success: boolean; data: PaymentResponse }> {
  return this.apiService.post<{ success: boolean; data: PaymentResponse }>(
    '/api/client/payments/initiate',
    request
  );
}

  /**
   * Get all client payments
   */
  getPaymentHistory(status?: string): Observable<PaymentHistoryResponse> {
    const queryParams = status ? `?status=${status}` : '';
    return this.apiService.get<PaymentHistoryResponse>(
      `/api/client/payments${queryParams}`
    );
  }

  /**
   * Get single payment details
   */
  getPaymentById(paymentId: number): Observable<PaymentResponse> {
    return this.apiService.get<PaymentResponse>(
      `/api/client/payments/${paymentId}`
    );
  }
}
