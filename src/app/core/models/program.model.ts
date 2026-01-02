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
 */
export interface ProgramResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  durationWeeks: number;
  totalExercises: number;
  price: number;
  isPublic: boolean;
  maxClients: number;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
  trainerProfileId: number;
  trainerUserName: string;
  trainerHandle: string;
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
  dayNumber: number;
  title: string;
  notes: string;
  exercises: ProgramDayExerciseResponse[];
}

/**
 * ProgramDayExerciseResponse DTO
 * Nested within ProgramDayResponse.exercises
 * Represents an exercise assigned to a program day
 */
export interface ProgramDayExerciseResponse {
  programDayId: number;
  exerciseId: number;
  orderIndex: number;
  sets: number;
  reps: number;
  restSeconds: number;
  tempo: string;
  rpe: string;
  percent1RM: string;
  notes: string;
  videoUrl: string;
  exerciseDataJson: string;
  exerciseName: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  videoDemoUrl: string;
  thumbnailUrl: string;
  isCustom: boolean;
  trainerId: number;
}
