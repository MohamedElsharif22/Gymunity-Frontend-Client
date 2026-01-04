import { Injectable, signal, computed } from '@angular/core';

export interface ExerciseResult {
  exerciseId: number;
  exerciseName: string;
  sets: number;
  repsPerSet: number[];
  totalReps: number;
  completedAt?: string;
}

export interface WorkoutDaySession {
  programDayId: number;
  dayTitle: string;
  dayNotes?: string;
  exercises: ExerciseResult[];
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutSessionService {
  private sessionSignal = signal<WorkoutDaySession | null>(null);
  private exercisesListSignal = signal<any[]>([]);

  session = computed(() => this.sessionSignal());
  exercisesList = computed(() => this.exercisesListSignal());
  completedExercisesCount = computed(() => {
    const s = this.sessionSignal();
    return s ? s.exercises.filter(ex => ex.repsPerSet && ex.repsPerSet.length > 0).length : 0;
  });

  isAllExercisesCompleted = computed(() => {
    const s = this.sessionSignal();
    if (!s) return false;
    return s.exercises.length > 0 && s.exercises.every(ex => ex.repsPerSet && ex.repsPerSet.length > 0);
  });

  startDay(programDayId: number, dayTitle: string, dayNotes: string, exercisesList: any[]): void {
    const now = new Date().toISOString();
    const initialExercises: ExerciseResult[] = exercisesList.map(ex => ({
      exerciseId: ex.exerciseId || ex.id,
      exerciseName: ex.excersiceName || ex.name,
      sets: ex.sets || 0,
      repsPerSet: [],
      totalReps: 0
    }));

    this.sessionSignal.set({
      programDayId,
      dayTitle,
      dayNotes,
      exercises: initialExercises,
      startedAt: now,
      durationMinutes: 0
    });

    this.exercisesListSignal.set(exercisesList);
  }

  completeExercise(exerciseId: number, repsPerSet: number[]): void {
    const s = this.sessionSignal();
    if (!s) return;

    const exercise = s.exercises.find(ex => ex.exerciseId === exerciseId);
    if (!exercise) return;

    exercise.repsPerSet = repsPerSet;
    exercise.totalReps = repsPerSet.reduce((a, b) => a + b, 0);
    exercise.completedAt = new Date().toISOString();

    this.sessionSignal.set({ ...s });
  }

  isDayCompleted(): boolean {
    return this.isAllExercisesCompleted();
  }

  getSummary(): WorkoutDaySession | null {
    const s = this.sessionSignal();
    if (!s) return null;

    const endTime = new Date();
    const startTime = new Date(s.startedAt);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    return {
      ...s,
      endedAt: endTime.toISOString(),
      durationMinutes: duration
    };
  }

  getExerciseById(exerciseId: number): any {
    return this.exercisesListSignal().find(ex => ex.exerciseId === exerciseId || ex.id === exerciseId);
  }

  reset(): void {
    this.sessionSignal.set(null);
    this.exercisesListSignal.set([]);
  }
}
