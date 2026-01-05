import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

export interface WorkoutSetLog {
  setIndex: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutExerciseLog {
  exerciseId: number;
  sets: WorkoutSetLog[];
  durationSeconds: number;
}

export interface WorkoutSessionState {
  programDayId: number;
  startedAt: Date;
  exercises: WorkoutExerciseLog[];
  completedExerciseIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutStateService {
  private apiService = inject(ApiService);

  private workoutSession = signal<WorkoutSessionState | null>(null);

  readonly session = this.workoutSession.asReadonly();

  initializeWorkout(
    programDayId: number,
    exercises: Array<{ id: number; sets: number; reps: string }>
  ): void {
    const exerciseLogs = exercises.map((ex) => ({
      exerciseId: ex.id,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        setIndex: i + 1,
        reps: 0,
        completed: false
      })),
      durationSeconds: 0
    }));

    this.workoutSession.set({
      programDayId,
      startedAt: new Date(),
      exercises: exerciseLogs,
      completedExerciseIds: []
    });
  }

  logSetCompletion(exerciseId: number, setIndex: number, reps: number): void {
    this.workoutSession.update((session) => {
      if (!session) return session;

      const exercise = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (exercise) {
        const set = exercise.sets[setIndex - 1];
        if (set) {
          set.reps = reps;
          set.completed = true;
        }
      }

      return session;
    });
  }

  completeExercise(exerciseId: number, durationSeconds: number): void {
    this.workoutSession.update((session) => {
      if (!session) return session;

      const exercise = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (exercise) {
        exercise.durationSeconds = durationSeconds;
      }

      if (!session.completedExerciseIds.includes(exerciseId)) {
        session.completedExerciseIds.push(exerciseId);
      }

      return session;
    });
  }

  isExerciseLocked(exerciseId: number): boolean {
    const session = this.workoutSession();
    if (!session) return false;

    const exerciseIndex = session.exercises.findIndex((e) => e.exerciseId === exerciseId);
    if (exerciseIndex === 0) return false;

    const previousExerciseId = session.exercises[exerciseIndex - 1].exerciseId;
    return !session.completedExerciseIds.includes(previousExerciseId);
  }

  isExerciseCompleted(exerciseId: number): boolean {
    const session = this.workoutSession();
    return session ? session.completedExerciseIds.includes(exerciseId) : false;
  }

  getAllExercisesCompleted(): boolean {
    const session = this.workoutSession();
    if (!session) return false;
    return session.completedExerciseIds.length === session.exercises.length;
  }

  private buildExercisesLoggedJson(): string {
    const session = this.workoutSession();
    if (!session) return '';

    const exercisesData = session.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets.map((set) => ({
        setIndex: set.setIndex,
        reps: set.reps,
        completed: set.completed
      })),
      durationSeconds: ex.durationSeconds
    }));

    return JSON.stringify(exercisesData);
  }

  async submitWorkoutLog(notes?: string): Promise<void> {
    const session = this.workoutSession();
    if (!session) {
      throw new Error('No active workout session');
    }

    const now = new Date();

    // Calculate duration with robust validation
    // Use Math.floor to ensure we don't round up to invalid values
    let durationMinutes = Math.floor((now.getTime() - session.startedAt.getTime()) / 60000);

    // Apply defensive clamping to ensure backend validation passes
    // Backend allows: 1 <= durationMinutes <= 600
    const MIN_DURATION = 1;
    const MAX_DURATION = 600;

    if (durationMinutes < MIN_DURATION) {
      console.warn(`⚠️ Duration too short (${durationMinutes} min), clamping to minimum: ${MIN_DURATION} min`);
      durationMinutes = MIN_DURATION;
    } else if (durationMinutes > MAX_DURATION) {
      console.warn(`⚠️ Duration too long (${durationMinutes} min), clamping to maximum: ${MAX_DURATION} min`);
      durationMinutes = MAX_DURATION;
    }

    console.log(`✅ Valid duration calculated: ${durationMinutes} minutes (range: ${MIN_DURATION}-${MAX_DURATION})`);

    const payload = {
      programDayId: session.programDayId,
      completedAt: now.toISOString(),
      durationMinutes,
      notes: notes || undefined,
      exercisesLoggedJson: this.buildExercisesLoggedJson()
    };

    await this.apiService.post('/api/client/WorkoutLog', payload).toPromise();
  }

  clearWorkout(): void {
    this.workoutSession.set(null);
  }
}
