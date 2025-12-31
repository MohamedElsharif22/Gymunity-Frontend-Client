/**
 * Common models including reviews, pagination, and API responses
 * Aligns with Gymunity Backend API specification
 */

export interface Review {
  id?: number;
  trainerId?: number;
  clientId?: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateReviewRequest {
  clientId: string;
  rating: number;
  comment?: string;
}

// Generic pagination models
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Search results wrapper
export interface SearchResults {
  trainers?: any[];
  packages?: any[];
  programs?: any[];
}
