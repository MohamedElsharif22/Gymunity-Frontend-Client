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
