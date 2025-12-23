import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Payment, InitiatePaymentRequest, PaymentResponse, PaymentStatus } from '../../../core/models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiService = inject(ApiService);

  initiatePayment(request: InitiatePaymentRequest): Observable<PaymentResponse> {
    return this.apiService.post<PaymentResponse>('/api/client/payments/initiate', request);
  }

  getPayments(status?: PaymentStatus): Observable<Payment[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.apiService.get<Payment[]>('/api/client/payments', params);
  }

  getPaymentById(paymentId: number): Observable<Payment> {
    return this.apiService.get<Payment>(`/api/client/payments/${paymentId}`);
  }

  getPaymentStatus(paymentId: number): Observable<PaymentStatus> {
    return this.apiService.get<PaymentStatus>(`/api/client/payments/${paymentId}/status`);
  }
}
