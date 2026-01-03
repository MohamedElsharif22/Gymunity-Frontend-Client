/**
 * Subscription, package, and membership models
 * Aligns with Gymunity Backend API specification
 * Reference: Client-Subscriptions.md
 */

import { Program, TrainerProfile } from './program.model';

// ==================== API Response Models ====================

export interface SubscriptionResponse {
  id: number;
  clientId: string;
  packageId: number;
  packageName?: string;
  trainerId?: number;
  trainerName?: string;
  status: SubscriptionStatus;
  startDate: string; // ISO datetime
  currentPeriodEnd: string; // ISO datetime
  amountPaid: number;
  currency: string;
  isAnnual: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Subscription extends SubscriptionResponse {
  promoCode?: string;
  discount?: number;
  endDate?: Date;
}

// ==================== Request Models ====================

export interface SubscribePackageRequest {
  packageId: number;
  isAnnual?: boolean; // default: false
}

export interface ActivateSubscriptionRequest {
  transactionId: string;
}

export interface SubscribeRequest extends SubscribePackageRequest {
  promoCode?: string;
}

// ==================== Package Models ====================

export interface Package {
  id: number;
  trainerId: string;
  trainerName?: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  thumbnailUrl?: string;
  programIds?: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PackageDetails extends Package {
  programs?: Program[];
  trainer?: TrainerProfile;
}

// ==================== Status Enum ====================

export enum SubscriptionStatus {
  Unpaid = 'Unpaid',
  Active = 'Active',
  Expired = 'Expired',
  Canceled = 'Canceled',
  Cancelled = 'Cancelled',
  Paused = 'Paused'
}
