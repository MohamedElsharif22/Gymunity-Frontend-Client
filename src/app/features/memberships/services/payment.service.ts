import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Payment, InitiatePaymentRequest, PaymentResponse, PaymentStatus, PaginatedResponse } from '../../../core/models';
import { HttpParams } from '@angular/common/http';

/**
 * Payment Service
 * Handles payment processing and transaction management
 * Follows Angular best practices with providedIn: 'root' and inject()
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiService = inject(ApiService);

  /**
   * Initiate a payment for a subscription
   */
  initiatePayment(request: InitiatePaymentRequest): Observable<PaymentResponse> {
    return this.apiService.post<PaymentResponse>('/api/client/payments/initiate', request);
  }

  /**
   * Get all payments with optional status filter
   */
  getPayments(): Observable<PaginatedResponse<Payment>> {
    return this.apiService.get<PaginatedResponse<Payment>>('/api/client/payments');
  }

  /**
   * Get payment by ID
   */
  getPaymentById(paymentId: number): Observable<Payment> {
    return this.apiService.get<Payment>(`/api/client/payments/${paymentId}`);
  }

  /**
   * Get the status of a payment
   */
  getPaymentStatus(paymentId: number): Observable<PaymentStatus> {
    return this.apiService.get<PaymentStatus>(`/api/client/payments/${paymentId}/status`);
  }
}

