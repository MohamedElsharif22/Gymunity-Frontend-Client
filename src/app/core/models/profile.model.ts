// Client profile and onboarding models
export interface ClientProfile {
  id: string;
  userId: string;
  userName: string;
  heightCm: number;
  startingWeightKg: number;
  currentWeightKg?: number;
  gender: string;
  goal: string;
  experienceLevel: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  goal: string;
  experienceLevel: string;
}

export interface OnboardingStatus {
  isProfileCompleted: boolean;
  completedAt?: Date;
}
