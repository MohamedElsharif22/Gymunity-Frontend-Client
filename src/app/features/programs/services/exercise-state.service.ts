import { Injectable, signal } from '@angular/core';
import { Exercise } from './program.service';

@Injectable({
  providedIn: 'root'
})
export class ExerciseStateService {
  private currentExercise = signal<Exercise | null>(null);

  setCurrentExercise(exercise: Exercise | null) {
    this.currentExercise.set(exercise);
  }

  getCurrentExercise(): Exercise | null {
    return this.currentExercise();
  }

  clearCurrentExercise() {
    this.currentExercise.set(null);
  }
}
