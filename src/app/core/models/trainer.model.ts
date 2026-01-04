/**
 * Trainer Models
 * Defines interfaces for trainer discovery API responses and related data structures
 */

/**
 * TrainerCard - Represents a trainer in the trainer discovery list
 * Contains all essential information for displaying trainer cards and applying filters
 */
export interface TrainerCard {
  id: string;
  fullName: string;
  handle: string;
  profilePhotoUrl: string | null;
  coverImageUrl: string | null;
  bio: string | null;
  isVerified: boolean;
  ratingAverage: number;
  totalReviews: number;
  totalClients: number;
  yearsExperience: number;
  specializations: string[];
  startingPrice: number;
  currency: string;
  hasActiveSubscription: boolean;
}

/**
 * Pagination - Generic pagination wrapper for list responses
 * Used for paginated API responses from the backend
 *
 * @template T - The type of items in the paginated list
 */
export interface Pagination<T> {
  pageIndex: number;
  pageSize: number;
  count: number; // Total count of items
  data: T[];     // Array of items
}

/**
 * TrainerDiscoveryResponse - Response from the TrainerDiscovery API endpoint
 * Extends Pagination with trainer-specific list
 */
export type TrainerDiscoveryResponse = Pagination<TrainerCard>;

/**
 * TrainerSearchOptions - Query options for trainer discovery search
 * Maps to API query parameters
 */
export interface TrainerSearchOptions {
  search?: string;
  specialization?: string;
  minExperience?: number;
  maxPrice?: number;
  isVerified?: boolean;
  sortBy?: 'rating' | 'experience' | 'price' | 'reviews';
  page?: number;
  pageSize?: number;
}

/**
 * TrainerProfileDetail - Full trainer profile information
 * Retrieved from /api/trainer/TrainerProfile/Id/{id} endpoint
 * Used for detailed trainer profile page
 */
export interface TrainerProfileDetail {
  id: number;
  userId: string;
  userName?: string;
  email?: string;
  handle?: string;
  bio?: string;
  profilePhotoUrl?: string | null;
  coverImageUrl?: string | null;
  videoIntroUrl?: string | null;
  isVerified?: boolean;
  verifiedAt?: string | null;
  isSuspended?: boolean;
  suspendedAt?: string | null;
  ratingAverage?: number;
  totalClients?: number;
  yearsExperience?: number;
  specializations?: string[];
  packages?: any[]; // TODO: Define package DTO if needed
  startingPrice?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}
