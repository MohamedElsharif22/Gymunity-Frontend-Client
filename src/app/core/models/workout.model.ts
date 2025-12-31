/**
 * Workout logging and body state tracking models
 * Aligns with Gymunity Backend API specification
 */

export interface WorkoutLog {
  id: number;
  clientProfileId: number;
  programDayId: number;
  programDayName?: string;
  completedAt: Date;
  notes?: string;
  durationMinutes: number;
  exercisesLoggedJson?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateWorkoutLogRequest {
  programDayId: number;
  completedAt: Date;
  notes?: string;
  durationMinutes: number;
  exercisesLoggedJson?: string;
}

export interface UpdateWorkoutLogRequest {
  programDayId: number;
  completedAt: Date;
  notes?: string;
  durationMinutes: number;
  exercisesLoggedJson?: string;
}

// BodyStateLog is defined in profile.model.ts - import from there
export type { BodyStateLog } from './profile.model';

export interface CreateBodyStateLogRequest {
  weightKg: number;
  bodyFatPercent?: number;
  measurementsJson?: string;
  photoFrontUrl?: string;
  photoSideUrl?: string;
  photoBackUrl?: string;
  notes?: string;
}

export interface ExerciseLog {
  exerciseId: number;
  sets: number;
  reps: number[];
  weight?: number;
  notes?: string;
}
