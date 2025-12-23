// Subscription and membership models
import { Program, TrainerProfile } from './program.model';

export interface Subscription {
  id: number;
  clientId: string;
  packageId: number;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  isAnnual: boolean;
  promoCode?: string;
  discount?: number;
  finalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubscribeRequest {
  packageId: number;
  isAnnual: boolean;
  promoCode?: string;
}

export interface Package {
  id: number;
  trainerId: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  thumbnailUrl?: string;
  programIds: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PackageDetails extends Package {
  programs?: Program[];
  trainer?: TrainerProfile;
}

export enum SubscriptionStatus {
  Active = 'Active',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
  Paused = 'Paused'
}
