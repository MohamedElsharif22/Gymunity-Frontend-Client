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
 * Per TrainerDiscovery API: uses 'items' array and 'totalCount' field
 *
 * @template T - The type of items in the paginated list
 */
export interface Pagination<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number; // Total count of items (API field name)
  items: T[];         // Array of items (API field name)
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
 * TrainerProfileDetailResponse - Detailed trainer profile response from API
 * GET /api/client/TrainerDiscovery/{trainerId}
 * Contains comprehensive trainer information for the detail page
 */
export interface TrainerProfileDetailResponse {
  data?: TrainerCard; // The actual trainer card data (nullable in response)
  message?: string;
  statusCode?: number;
}
