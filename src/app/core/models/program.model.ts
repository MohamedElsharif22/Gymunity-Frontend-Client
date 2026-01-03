/**
 * Program, trainer, and exercise models
 * Aligns with Gymunity Backend API specification
 */

export interface Program {
  id: number;
  trainerId: string;
  trainerName?: string;
  title: string;
  description: string;
  type: ProgramType;
  durationWeeks: number;
  price?: number;
  isPublic: boolean;
  maxClients?: number;
  thumbnailUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProgramDetails extends Program {
  weeks?: ProgramWeek[];
  trainer?: TrainerProfile;
}

export interface ProgramWeek {
  id: number;
  programId: number;
  weekNumber: number;
  days?: ProgramDay[];
}

export interface ProgramDay {
  id: number;
  programWeekId: number;
  dayNumber: number;
  title: string;
  notes?: string;
  exercises?: DayExercise[];
}

export interface DayExercise {
  id: number;
  programDayId: number;
  exerciseId: number;
  orderIndex: number;
  sets: string;
  reps: string;
  restSeconds: number;
  tempo?: string;
  rpe?: number;
  percent1RM?: number;
  notes?: string;
  videoUrl?: string;
  exerciseDataJson?: string;
  exercise?: Exercise;
}

export interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  videoDemoUrl?: string;
  thumbnailUrl?: string;
  isCustom: boolean;
}

export interface TrainerProfile {
  id: number;
  userId: string;
  userName?: string;
  profilePhotoUrl?: string;
  bio?: string;
  specialization?: string;
  yearsOfExperience?: number;
  certification?: string;
  rating?: number;
  totalClients?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExerciseLibrary {
  id: number;
  trainerId: string;
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  videoDemoUrl?: string;
  thumbnailUrl?: string;
  isCustom: boolean;
  createdAt?: Date;
}

export enum ProgramType {
  Strength = 1,
  Hypertrophy = 2,
  Endurance = 3,
  FatLoss = 4,
  General = 5
}

/**
 * ============================================================
 * Client Programs API DTOs (from ClientProgramsController)
 * Represents the authenticated user's programs
 * ============================================================
 */

/**
 * ProgramResponse DTO
 * Returned by GET /api/client/programs/ and GET /api/client/programs/{programId}
 * Represents a program available to the authenticated user
 *
 * totalExercises: Computed field showing total unique exercises across all weeks
 * price: null if subscription-only, otherwise the price in currency units
 * maxClients: null for unlimited concurrent clients
 */
export interface ProgramResponse {
  id: number;
  title: string;
  description: string;
  type: string; // 'Workout', 'Nutrition', 'Hybrid', 'Challenge'
  durationWeeks: number; // Computed from total weeks in program
  totalExercises: number; // Computed from program weeks/exercises
  price?: number | null;
  isPublic: boolean;
  maxClients?: number | null;
  thumbnailUrl?: string;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  trainerProfileId?: number;
  trainerUserName?: string;
  trainerHandle?: string;
}

/**
 * ProgramWeekResponse DTO
 * Returned by GET /api/client/programs/{programId}/weeks
 * Represents a week within a program
 */
export interface ProgramWeekResponse {
  id: number;
  programId: number;
  weekNumber: number;
}

/**
 * ProgramDayResponse DTO
 * Returned by GET /api/client/programs/{weekId}/days and GET /api/client/programs/days/{dayId}
 * Represents a day within a program week with its exercises
 */
export interface ProgramDayResponse {
  id: number;
  programWeekId: number;
  dayNumber: number; // 1-7 (day of week)
  title?: string; // Optional, e.g., "Upper Body A", "Rest"
  notes?: string; // Optional notes/instructions
  exercises: ProgramDayExerciseResponse[];
}

/**
 * ProgramDayExerciseResponse DTO
 * Nested within ProgramDayResponse.exercises
 * Represents an exercise assigned to a program day
 *
 * Sets/Reps: Can be simple (e.g., "3", "8-12") or complex (e.g., "5x5", "AMRAP")
 * Tempo: 4-digit code (eccentric-pause-concentric-pause), e.g., "3010"
 * RPE: Rate of Perceived Exertion (0-10 scale)
 * Percent1RM: Percentage of 1-Rep Max
 */
export interface ProgramDayExerciseResponse {
  programDayId: number;
  exerciseId: number;
  orderIndex: number; // 1-based order in the day
  sets?: string; // e.g., "3", "3-4", "5x5"
  reps?: string; // e.g., "8-12", "AMRAP"
  restSeconds?: number;
  tempo?: string; // 4-digit code: "3010"
  rpe?: number; // 0-10 scale
  percent1RM?: number;
  notes?: string; // Exercise-specific notes/cues
  videoUrl?: string; // Custom video URL for this assignment
  exerciseDataJson?: string; // Complex JSON data (supersets, circuits, AMRAP specs)
  excersiceName: string; // Exercise name (note: API has typo "excersice")
  category: string; // e.g., "Strength", "Cardio", "Flexibility"
  muscleGroup: string; // Primary muscle group trained
  equipment?: string; // e.g., "Barbell", "Dumbbell"
  videoDemoUrl?: string; // Official demo video URL
  thumbnailUrl?: string; // Exercise thumbnail image
  isCustom: boolean; // Whether exercise is trainer-created
  trainerId?: string; // Creator trainer ID; null if from global library
}
