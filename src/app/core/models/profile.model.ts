/**
 * Client profile, onboarding, and dashboard models
 * Aligns with Gymunity Backend API specification
 */

export interface ClientProfile {
  id: number;
  userName: string;
  heightCm: number;
  startingWeightKg: number;
  gender: string;
  goal: string;
  experienceLevel: string;
  updatedAt?: Date;
  createdAt?: Date;
  bodyStateLog?: BodyStateLog | null;
}

export interface CreateClientProfileRequest {
  userName: string;
  heightCm: number;
  startingWeightKg: number;
  gender: string;
  goal: string;
  experienceLevel: string;
}

export interface UpdateClientProfileRequest {
  userName: string;
  heightCm: number;
  startingWeightKg: number;
  gender: string;
  goal: string;
  experienceLevel: string;
}

export interface OnboardingCompleteRequest {
  heightCm: number;
  startingWeightKg: number;
  gender: string;
  goal: string;
  experienceLevel: string;
}

export interface DashboardResponse {
  userName: string;
  goal: string;
  experienceLevel: string;
  isOnboardingCompleted: boolean;
  lastBodyState?: BodyStateLog;
  bodyStateHistory?: BodyStateLog[];
  profileCreatedAt?: Date;
}

export interface BodyStateLog {
  id?: number;
  weightKg: number;
  bodyFatPercent?: number;
  measurementsJson?: string;
  photoFrontUrl?: string;
  photoSideUrl?: string;
  photoBackUrl?: string;
  notes?: string;
  loggedAt?: Date;
}
