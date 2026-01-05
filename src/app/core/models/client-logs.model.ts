import { BodyStateLog } from './profile.model';
import { BodyStateLogResponse } from './client-profile.model';

// Re-export BodyStateLogResponse from client-profile
export type { BodyStateLogResponse };

// Body State Log DTOs
export interface CreateBodyStateLogRequest {
  weightKg?: number;
  bodyFatPercent?: number;
  measurementsJson?: string;
  photoFrontUrl?: string;
  photoSideUrl?: string;
  photoBackUrl?: string;
  notes?: string;
}

// Onboarding DTOs
export interface OnboardingRequest {
  heightCm?: number;
  startingWeightKg?: number;
  goal?: string;
  experienceLevel?: string;
}

// Workout Log DTOs
export interface WorkoutLogRequest {
  programDayId: number;
  exercisesLoggedJson?: string;
  notes?: string;
  durationMinutes?: number;
}

export interface WorkoutLogResponse {
  id: number;
  clientProfileId: number;
  programDayId: number;
  programDayName?: string;
  completedAt: string;
  notes?: string;
  durationMinutes?: number;
  exercisesLoggedJson: string;
  createdAt: string;
  updatedAt?: string;
}
