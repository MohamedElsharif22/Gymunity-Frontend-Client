/**
 * HomeClient API Models
 * Represents responses from /api/homeclient endpoints
 * Used for public/client-facing home, search, packages, programs, and trainers
 */

/**
 * ProgramBrief - Minimal program information
 * Used within PackageClient response
 */
export interface ProgramBrief {
  title: string;
  description?: string;
  durationWeeks?: number;
  thumbnailUrl?: string;
}

/**
 * PackageClient - Package information from HomeClient API
 * Retrieved from /api/homeclient/packages endpoints
 */
export interface PackageClient {
  id: number;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly?: number | null;
  isActive: boolean;
  thumbnailUrl?: string | null;
  trainerId: string; // user id
  createdAt: string; // ISO datetime
  isAnnual: boolean;
  promoCode?: string | null;
  programs?: ProgramBrief[];
}

/**
 * ProgramClient - Program information from HomeClient API
 * Retrieved from /api/homeclient/programs endpoints
 */
export interface ProgramClient {
  id: number;
  title: string;
  description: string;
  type: string | number; // ProgramType enum
  durationWeeks: number;
  price?: number | null;
  isPublic: boolean;
  maxClients?: number | null;
  thumbnailUrl?: string | null;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  trainerId: string; // user id
  trainerProfileId?: number | null;
  trainerUserName?: string | null;
  trainerHandle?: string | null;
}

/**
 * TrainerClient - Trainer information from HomeClient API
 * Retrieved from /api/homeclient/trainers endpoints
 * Lightweight version compared to TrainerProfileDetail
 */
export interface TrainerClient {
  id: number;
  userId: string;
  userName: string;
  handle: string;
  bio: string;
  coverImageUrl?: string | null;
  ratingAverage: number;
  totalClients: number;
}

/**
 * HomeClientSearchResponse - Response from search endpoint
 * GET /api/homeclient/search?term={term}
 */
export interface HomeClientSearchResponse {
  packages: PackageClient[];
  programs: ProgramClient[];
  trainers: TrainerClient[];
}
