/**
 * Payment, transaction, and billing models
 * Aligns with Gymunity Backend API specification
 * Supports Stripe Checkout Sessions and PayPal integration
 */

// ==================== Enums ====================

/**
 * Payment Status - Represents the state of a payment transaction
 */
export enum PaymentStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Refunded = 3,
  Processing = 4
}

/**
 * Payment Method - Represents the payment gateway used
 */
export enum PaymentMethod {
  Paymob = 0,
  PayPal = 1,
  Stripe = 2
}

// Import SubscriptionStatus from subscription.model to avoid duplication
import { SubscriptionStatus } from './subscription.model';
export { SubscriptionStatus };

// ==================== Interfaces ====================

/**
 * Core Payment interface
 */
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

/**
 * Comprehensive Payment Response from backend
 * Returned from /api/client/payments/initiate endpoint
 * Contains all necessary data for payment processing and tracking
 */
export interface PaymentResponse {
  id: number;
  subscriptionId: number;

  // Client Information
  clientId: string;
  clientName: string;
  clientEmail: string;

  // Subscription Information
  packageId: number;
  packageName: string;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  isAnnualSubscription: boolean;

  // Trainer Information
  trainerProfileId: number;
  trainerName: string;
  trainerHandle?: string;
  isTrainerVerified: boolean;
  trainerRating?: number;
  trainerTotalClients?: number;

  // Payment Amount Details
  amount: number;
  currency: string;
  platformFee: number;
  trainerPayout: number;

  // Payment Status & Method
  status: PaymentStatus;
  method: PaymentMethod;

  // Transaction Information
  transactionId?: string;
  failureReason?: string;

  // Payment Gateway URLs - Both Stripe and PayPal return hosted checkout URLs
  paymentUrl?: string;  // Main checkout URL (Stripe or PayPal)
  paymobOrderId?: string;
  payPalOrderId?: string;
  stripeSessionId?: string;

  // Dates
  createdAt: Date;
  paidAt?: Date;
  failedAt?: Date;
}

/**
 * Request to initiate a payment
 * Used to start the payment process with selected method
 */
export interface InitiatePaymentRequest {
  subscriptionId: number;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
}

/**
 * Parameters returned from payment gateway callback
 */
export interface PaymentReturnParams {
  subscriptionId: number;
  sessionId?: string;      // Stripe session ID
  orderId?: string;        // PayPal order ID
  paymentId?: string;      // Generic payment ID
  status?: string;         // Payment status
}

/**
 * Webhook data received from payment gateway
 */
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
