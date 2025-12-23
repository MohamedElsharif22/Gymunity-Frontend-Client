// Workout and body tracking models
export interface WorkoutLog {
  id: number;
  clientId: string;
  programDayId: number;
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

export interface BodyStateLog {
  id: number;
  clientId: string;
  weightKg: number;
  bodyFatPercent?: number;
  measurementsJson?: string;
  photoFrontUrl?: string;
  photoSideUrl?: string;
  photoBackUrl?: string;
  notes?: string;
  createdAt?: Date;
}

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
  name: string;
  setsCompleted: number;
  repsPerSet: number[];
  weightUsed?: number;
  notes?: string;
}
