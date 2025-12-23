// Payment and transaction models
export interface Payment {
  id: number;
  clientId: string;
  subscriptionId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  reference?: string;
  createdAt?: Date;
  completedAt?: Date;
}

export interface InitiatePaymentRequest {
  subscriptionId: number;
  paymentMethod: PaymentMethod;
  returnUrl: string;
}

export interface PaymentResponse {
  id: number;
  paymentUrl?: string;
  clientSecret?: string;
  status: PaymentStatus;
}

export interface WebhookPaymentData {
  type: string;
  obj: {
    id: number;
    success: boolean;
    amount_cents: number;
    currency: string;
    order: {
      merchant_order_id: string;
    };
    created_at: Date;
  };
}

export enum PaymentStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded'
}

export enum PaymentMethod {
  CreditCard = 1,
  Debit = 2,
  MobileWallet = 3,
  BankTransfer = 4
}
