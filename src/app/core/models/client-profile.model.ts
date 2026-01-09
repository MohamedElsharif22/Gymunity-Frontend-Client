/**
 * Client Profile Models
 * DTOs matching ClientProfileController backend API
 * All operations require JWT Bearer authentication
 */

// ==================== Enums ====================

/**
 * Client fitness goals
 */
export enum ClientGoal {
  FatLoss = 1,
  MuscleGain = 2,
  Maintenance = 3,
  Endurance = 4,
  Flexibility = 5,
  Strength = 6,
  WeightLoss = 7,
  WeightGain = 8,
  GeneralFitness = 9
}

/**
 * Client fitness experience level
 */
export enum ExperienceLevel {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3
}

/**
 * Client gender
 */
export enum Gender {
  Male = 1,
  Female = 2
}

// ==================== Input DTOs ====================

/**
 * Request DTO for creating/updating client profile
 * Used in POST /api/client/profile and PUT /api/client/profile
 */
export interface ClientProfileRequest {
  userName: string;
  heightCm?: number;
  startingWeightKg?: number;
  gender?: Gender;
  goal?: ClientGoal;
  experienceLevel?: ExperienceLevel;
}

// ==================== Output DTOs ====================

/**
 * Body state log response
 * Current weight and body composition tracking
 */
export interface BodyStateLogResponse {
  id?: number;
  weightKg: number;
  bodyFatPercent?: number;
  measurementsJson?: string;
  photoFrontUrl?: string;
  photoSideUrl?: string;
  photoBackUrl?: string;
  notes?: string;
  loggedAt: string;
}

/**
 * Response DTO for client profile
 * Returned by GET, POST, and PUT endpoints
 */
export interface ClientProfileResponse {
  id: number;
  userName: string;
  heightCm?: number;
  startingWeightKg?: number;
  gender?: Gender;
  goal?: ClientGoal;
  experienceLevel?: ExperienceLevel;
  updatedAt?: Date;
  createdAt: Date;
  bodyStateLog?: BodyStateLogResponse;
}

// ==================== Dashboard & Related DTOs ====================

/**
 * Complete dashboard response with aggregated client data
 * Returned by GET /api/client/profile/dashboard
 */
export interface ClientProfileDashboardResponse {
  summary: ClientProfileSummary;
  activePrograms?: ProgramSummary[];
  activeSubscriptions?: SubscriptionSummary[];
  recentActivity?: ActivitySummary[];
  metrics?: ProgressMetrics;
}

/**
 * Client profile summary for dashboard
 * Contains key profile information and statistics
 */
export interface ClientProfileSummary {
  profileId: number;
  userName: string;
  currentWeight?: number;
  heightCm?: number;
  goal?: ClientGoal;
  experienceLevel?: ExperienceLevel;
  totalWorkouts: number;
  activeProgramCount: number;
  activeSubscriptionCount: number;
}

/**
 * Program summary for dashboard
 * Shows active programs user is enrolled in
 */
export interface ProgramSummary {
  id: number;
  title: string;
  durationWeeks: number;
  weekNumber: number;
}

/**
 * Subscription summary for dashboard
 * Shows active memberships/packages
 */
export interface SubscriptionSummary {
  id: number;
  packageName: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

/**
 * Activity summary for dashboard
 * Recent workouts and activities
 */
export interface ActivitySummary {
  date: Date;
  activityType: string;
  description: string;
}

/**
 * Progress metrics for dashboard
 * Shows fitness progress over time
 */
export interface ProgressMetrics {
  weightChange?: number;
  workoutCompletionRate: number;
  totalWorkoutMinutes: number;
}
