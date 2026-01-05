import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkoutStateService } from '../../services/workout-state.service';

@Component({
  selector: 'app-workout-completion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="completion-overlay">
      <div class="completion-modal">
        <div class="success-icon">✓</div>
        <h2>Workout Day Completed!</h2>
        <p>Great job! You've completed all exercises for this workout day.</p>

        @if (completedExercises().length > 0) {
          <div class="exercises-summary">
            <h3>Exercises Summary</h3>
            <div class="exercises-list">
              @for (exercise of completedExercises(); track exercise.id) {
                <div class="exercise-item">
                  <span class="exercise-name">{{ exercise.name }}</span>
                  <span class="exercise-sets">{{ exercise.sets }} sets</span>
                  <span class="exercise-check">✓</span>
                </div>
              }
            </div>
          </div>
        }

        <form class="notes-form">
          <textarea
            placeholder="Add a note about your workout (optional)"
            [(ngModel)]="notes"
            name="notes"
          ></textarea>
        </form>

        <div class="actions">
          <button
            class="btn btn-secondary"
            (click)="goBack()"
          >
            Back to Programs
          </button>
          <button
            class="btn btn-primary"
            (click)="submitWorkout()"
            [disabled]="submitting()"
          >
            {{ submitting() ? 'Saving to Backend...' : 'Complete Workout' }}
          </button>
        </div>

        @if (error()) {
          <div class="error-message">{{ error() }}</div>
        }

        @if (success()) {
          <div class="success-message">Workout saved successfully!</div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .completion-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 1rem;
      }

      .completion-modal {
        background: #1a1a1a;
        padding: 3rem;
        border-radius: 1rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        max-width: 600px;
        width: 100%;
        text-align: center;
        color: white;
      }

      .success-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 1rem;
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        font-weight: bold;
        animation: scaleIn 0.5s ease;
      }

      h2 {
        font-size: 1.8rem;
        margin: 1rem 0;
        color: #fff;
      }

      p {
        color: #bbb;
        margin-bottom: 2rem;
      }

      .exercises-summary {
        background: #2a2a2a;
        padding: 1.5rem;
        border-radius: 0.75rem;
        margin-bottom: 2rem;
      }

      .exercises-summary h3 {
        font-size: 1.1rem;
        margin-bottom: 1rem;
        color: #fff;
      }

      .exercises-list {
        max-height: 250px;
        overflow-y: auto;
      }

      .exercise-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: #1a1a1a;
        border-radius: 0.5rem;
        margin-bottom: 0.5rem;
        border-left: 3px solid #667eea;
      }

      .exercise-name {
        flex: 1;
        text-align: left;
        color: #fff;
        font-weight: 500;
      }

      .exercise-sets {
        color: #999;
        font-size: 0.9rem;
        margin-right: 1rem;
      }

      .exercise-check {
        color: #4caf50;
        font-weight: bold;
        font-size: 1.2rem;
      }

      .notes-form {
        margin-bottom: 2rem;
      }

      textarea {
        width: 100%;
        min-height: 100px;
        padding: 0.75rem;
        border: 1px solid #444;
        border-radius: 0.5rem;
        font-family: inherit;
        font-size: 0.95rem;
        resize: vertical;
        background: #2a2a2a;
        color: white;
      }

      textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      }

      .actions {
        display: flex;
        gap: 1rem;
      }

      .btn {
        flex: 1;
        padding: 0.9rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 1rem;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
      }

      .btn-secondary {
        background: #333;
        color: #aaa;
      }

      .btn-secondary:hover:not(:disabled) {
        background: #444;
        color: #fff;
      }

      .error-message {
        background: #c62828;
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-top: 1rem;
        font-size: 0.95rem;
      }

      .success-message {
        background: #4caf50;
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-top: 1rem;
        font-size: 0.95rem;
        animation: slideUp 0.3s ease;
      }

      @keyframes scaleIn {
        from {
          transform: scale(0);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 480px) {
        .completion-modal {
          padding: 2rem 1.5rem;
        }

        h2 {
          font-size: 1.4rem;
        }

        .actions {
          flex-direction: column;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutCompletionComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutStateService = inject(WorkoutStateService);

  notes = '';
  submitting = signal(false);
  error = signal('');
  success = signal(false);
  completedExercises = signal<any[]>([]);

  ngOnInit(): void {
    this.loadCompletedExercises();
  }

  private loadCompletedExercises(): void {
    const dayId = this.route.snapshot.queryParams['dayId'];
    if (!dayId) {
      this.error.set('Invalid workout session');
      return;
    }

    const storageKey = `workout_day_${dayId}`;
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const workoutData = JSON.parse(savedData);
        if (workoutData.exercises) {
          const exercises = Object.entries(workoutData.exercises).map(([id, data]: any) => ({
            id,
            name: data.exerciseName || `Exercise ${id}`,
            sets: data.sets ? data.sets.length : 0
          }));
          this.completedExercises.set(exercises);
        }
      } catch (e) {
        console.error('Failed to load exercises', e);
      }
    }
  }

  async submitWorkout(): Promise<void> {
    const dayId = this.route.snapshot.queryParams['dayId'];
    const programId = this.route.snapshot.queryParams['programId'];
    if (!dayId) {
      this.error.set('Invalid workout session');
      return;
    }

    this.submitting.set(true);
    this.error.set('');
    this.success.set(false);

    try {
      const storageKey = `workout_day_${dayId}`;
      const savedData = localStorage.getItem(storageKey);
      if (!savedData) {
        throw new Error('No workout data found');
      }

      const workoutData = JSON.parse(savedData);
      
      // Prepare payload for backend
      const payload = {
        workoutDayId: Number(dayId),
        exercises: Object.entries(workoutData.exercises || {}).map(([exerciseId, data]: any) => ({
          exerciseId: Number(exerciseId),
          sets: data.sets,
          completedAt: data.completedAt
        })),
        notes: this.notes || null,
        completedAt: new Date().toISOString()
      };

      // Submit to backend via WorkoutStateService
      await this.workoutStateService.submitWorkoutLog(this.notes || undefined);
      
      this.success.set(true);
      
      // Clear localStorage after successful submission
      localStorage.removeItem(storageKey);
      this.workoutStateService.clearWorkout();

      // Navigate back to program detail page to show all days
      setTimeout(() => {
        if (programId) {
          this.router.navigate(['/programs', programId]);
        } else {
          this.router.navigate(['/programs']);
        }
      }, 2000);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to save workout to backend');
      this.submitting.set(false);
    }
  }

  goBack(): void {
    const programId = this.route.snapshot.queryParams['programId'];
    if (programId) {
      this.router.navigate(['/programs', programId]);
    } else {
      this.router.navigate(['/programs']);
    }
  }
}
