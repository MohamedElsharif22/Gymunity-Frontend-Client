import { Injectable, signal } from '@angular/core';

export interface ExecutedExercise {
  exerciseId: number;
  exerciseName: string;
  setsCompleted: number;
  repsPerSet: number[];
  totalReps: number;
  completed: true;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutExecutionStateService {
  private programDayId = signal<number | null>(null);
  private workoutStartTime = signal<Date | null>(null);
  private workoutEndTime = signal<Date | null>(null);
  private executedExercises = signal<ExecutedExercise[]>([]);
  private completedExerciseIds = signal<number[]>([]);

  setProgramDayId(id: number) {
    this.programDayId.set(id);
  }

  getProgramDayId(): number | null {
    return this.programDayId();
  }

  startWorkout() {
    this.workoutStartTime.set(new Date());
  }

  endWorkout() {
    this.workoutEndTime.set(new Date());
  }

  addExecutedExercise(exercise: ExecutedExercise) {
    const current = this.executedExercises();
    this.executedExercises.set([...current, exercise]);

    // Add to completed list
    const completedIds = this.completedExerciseIds();
    if (!completedIds.includes(exercise.exerciseId)) {
      this.completedExerciseIds.set([...completedIds, exercise.exerciseId]);
    }
  }

  isExerciseCompleted(exerciseId: number): boolean {
    return this.completedExerciseIds().includes(exerciseId);
  }

  getExecutedExercises(): ExecutedExercise[] {
    return this.executedExercises();
  }

  getCompletedExerciseIds(): number[] {
    return this.completedExerciseIds();
  }

  getWorkoutStartTime(): Date | null {
    return this.workoutStartTime();
  }

  getWorkoutEndTime(): Date | null {
    return this.workoutEndTime();
  }

  getDurationMinutes(): number {
    const start = this.workoutStartTime();
    const end = this.workoutEndTime();
    if (!start || !end) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / 60000);
  }

  getTotalWorkoutReps(): number {
    return this.executedExercises().reduce((sum, ex) => sum + ex.totalReps, 0);
  }

  reset() {
    this.programDayId.set(null);
    this.workoutStartTime.set(null);
    this.workoutEndTime.set(null);
    this.executedExercises.set([]);
    this.completedExerciseIds.set([]);
  }
}
