import { Injectable, inject, signal } from '@angular/core';
import { ProgramDay, DayExercise } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';

export interface WorkoutSet {
  setNumber: number;
  targetReps: string;
  actualReps: number;
  weight?: number;
  notes?: string;
  completed: boolean;
  restSeconds: number;
}

export interface ExerciseProgress {
  exercise: DayExercise;
  sets: WorkoutSet[];
  completed: boolean;
  totalSetsCompleted: number;
  executionSummary?: {
    exerciseId: number | null;
    setsCompleted: number;
    repsPerSet: number[];
    totalReps: number;
    completed: boolean;
  };
}

export interface WorkoutSession {
  day: ProgramDay;
  exercises: ExerciseProgress[];
  startTime: Date;
  endTime?: Date;
  totalVolume: number;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  currentWorkoutSession = signal<WorkoutSession | null>(null);
  currentExerciseIndex = signal(0);
  private api = inject(ApiService);

  startWorkout(day: ProgramDay): void {
    const exercisesProgress: ExerciseProgress[] = (day.exercises || []).map(exercise => ({
      exercise,
      sets: this.initializeSets(exercise),
      completed: false,
      totalSetsCompleted: 0
    }));

    this.currentWorkoutSession.set({
      day,
      exercises: exercisesProgress,
      startTime: new Date(),
      totalVolume: 0,
      completed: false
    });
    this.currentExerciseIndex.set(0);
  }

  private initializeSets(exercise: DayExercise): WorkoutSet[] {
    const setCount = parseInt(exercise.sets || '0', 10);
    const sets: WorkoutSet[] = [];
    for (let i = 1; i <= setCount; i++) {
      sets.push({
        setNumber: i,
        targetReps: exercise.reps,
        actualReps: 0,
        weight: undefined,
        notes: '',
        completed: false,
        restSeconds: exercise.restSeconds || 60
      });
    }
    return sets;
  }

  completeSet(exerciseIndex: number, setIndex: number, actualReps: number, weight?: number): void {
    const session = this.currentWorkoutSession();
    if (!session) return;

    const exercise = session.exercises[exerciseIndex];
    if (!exercise) return;

    const set = exercise.sets[setIndex];
    if (!set) return;

    set.actualReps = actualReps;
    set.weight = weight;
    set.completed = true;

    // Update total sets completed for this exercise
    const completedSets = exercise.sets.filter(s => s.completed).length;
    exercise.totalSetsCompleted = completedSets;

    // Check if all sets for this exercise are done
    if (completedSets === exercise.sets.length) {
      exercise.completed = true;
    }

    // Update execution summary for this exercise
    try {
      const exId = (exercise.exercise as any)?.exerciseId ?? (exercise.exercise as any)?.id ?? null;
      const repsPerSet = exercise.sets.map(s => s.actualReps || 0);
      const totalReps = repsPerSet.reduce((a, b) => a + b, 0);
      exercise.executionSummary = {
        exerciseId: exId,
        setsCompleted: exercise.sets.filter(s => s.completed).length,
        repsPerSet,
        totalReps,
        completed: exercise.completed
      };
    } catch (e) {}

    // Recalculate total volume
    this.calculateTotalVolume();

    // Update the signal to trigger reactivity
    this.currentWorkoutSession.set({ ...session });
  }

  private calculateTotalVolume(): void {
    const session = this.currentWorkoutSession();
    if (!session) return;

    let total = 0;
    session.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (set.completed && set.actualReps > 0) {
          total += set.actualReps;
        }
      });
    });

    session.totalVolume = total;
  }

  getCurrentExercise(): ExerciseProgress | null {
    const session = this.currentWorkoutSession();
    if (!session) return null;
    return session.exercises[this.currentExerciseIndex()] || null;
  }

  moveToNextExercise(): boolean {
    const session = this.currentWorkoutSession();
    if (!session) return false;

    const nextIndex = this.currentExerciseIndex() + 1;
    if (nextIndex < session.exercises.length) {
      this.currentExerciseIndex.set(nextIndex);
      return true;
    }
    return false;
  }

  moveToPreviousExercise(): boolean {
    const currentIndex = this.currentExerciseIndex();
    if (currentIndex > 0) {
      this.currentExerciseIndex.set(currentIndex - 1);
      return true;
    }
    return false;
  }

  endWorkout(): WorkoutSession | null {
    const session = this.currentWorkoutSession();
    if (!session) return null;

    session.endTime = new Date();
    session.completed = true;

    // Check if all exercises are completed
    session.exercises.forEach(ex => {
      if (ex.sets.every(s => s.completed)) {
        ex.completed = true;
      }
    });

    this.currentWorkoutSession.set(session);
    return session;
  }

  /**
   * Prepare a workout payload for submission.
   * Structure is frontend-driven; adapt to backend contract if needed.
   */
  prepareWorkoutPayload(): any | null {
    const session = this.currentWorkoutSession();
    if (!session) return null;

    const exercises = session.exercises.map(ex => {
      const repsPerSet = ex.sets.map(s => s.actualReps || 0);
      const totalReps = repsPerSet.reduce((a, b) => a + b, 0);
      return {
        workoutDayId: session.day.id,
        exerciseId: (ex.exercise as any).exerciseId || (ex.exercise as any).id || null,
        totalSets: ex.sets.length,
        completedSets: ex.sets.filter(s => s.completed).length,
        repsPerSet,
        totalReps,
        completedAt: ex.sets.every(s => s.completed) ? new Date().toISOString() : null
      };
    });

    return {
      workoutDayId: session.day.id,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime ? session.endTime.toISOString() : undefined,
      totalVolume: session.totalVolume,
      completed: session.completed,
      exercises
    };
  }

  /** Submit the current workout session to the backend. */
  submitWorkoutSession() {
    const payload = this.prepareWorkoutPayload();
    if (!payload) throw new Error('No active workout session to submit');
    return this.api.post('/api/client/workouts', payload);
  }

  clearWorkout(): void {
    this.currentWorkoutSession.set(null);
    this.currentExerciseIndex.set(0);
  }
}
