/**
 * Workout Log Models
 * Aligns with Gymunity Backend API specification
 */

export interface WorkoutLog {
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

export interface CreateWorkoutLogRequest {
  programDayId: number;
  exercisesLoggedJson?: string;
  notes?: string;
  durationMinutes?: number;
}

export interface UpdateWorkoutLogRequest {
  exercisesLoggedJson?: string;
  notes?: string;
  durationMinutes?: number;
}
