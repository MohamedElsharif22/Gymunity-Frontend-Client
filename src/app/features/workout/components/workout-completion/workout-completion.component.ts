import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkoutStateService } from '../../services/workout-state.service';

const MOTIVATIONAL_MESSAGES = [
  { message: '🔥 Incredible effort! You\'re crushing it!', color: 'from-red-500 to-orange-500' },
  { message: '💪 Amazing! Look at that dedication!', color: 'from-blue-500 to-purple-500' },
  { message: '🌟 Outstanding performance! Keep it up!', color: 'from-yellow-500 to-orange-500' },
  { message: '✨ Fantastic work! You\'re on fire!', color: 'from-pink-500 to-rose-500' },
  { message: '🎯 Perfect execution! You\'re a champion!', color: 'from-emerald-500 to-teal-500' },
  { message: '⚡ Lightning fast! That was intense!', color: 'from-indigo-500 to-blue-500' },
  { message: '🚀 You\'re unstoppable! Great session!', color: 'from-violet-500 to-purple-500' },
  { message: '🏆 Champion energy! Well done today!', color: 'from-amber-500 to-yellow-500' }
];

@Component({
  selector: 'app-workout-completion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="completion-overlay">
      <!-- Celebration confetti -->
      <div class="confetti-container">
        <div class="confetti" *ngFor="let i of [].constructor(20)"></div>
      </div>

      <div class="completion-modal">
        <div class="success-icon-wrapper">
          <div class="success-icon">✓</div>
        </div>

        <div class="motivation-section" [ngClass]="'bg-gradient-to-r ' + motivationalMessage().color">
          <p class="motivation-text">{{ motivationalMessage().message }}</p>
        </div>

        <h2>Workout Complete! 🎉</h2>
        <p class="subtitle">Excellent session! You're building a stronger, healthier you.</p>

        @if (completedExercises().length > 0) {
          <div class="exercises-summary">
            <h3>🏋️ Exercises Completed ({{ completedExercises().length }})</h3>
            <div class="exercises-list">
              @for (exercise of completedExercises(); track exercise.id) {
                <div class="exercise-item">
                  <div class="exercise-left">
                    <span class="exercise-name">{{ exercise.name }}</span>
                    <span class="exercise-sets">{{ exercise.sets }} sets</span>
                  </div>
                  <span class="exercise-check">✓</span>
                </div>
              }
            </div>
          </div>
        }

        <form class="notes-form">
          <label class="notes-label">💬 Add a Note (Optional)</label>
          <textarea
            placeholder="How did you feel? Any thoughts about the workout?"
            [(ngModel)]="notes"
            name="notes"
            class="notes-textarea"
          ></textarea>
        </form>

        <div class="actions">
          <button
            class="btn btn-secondary"
            (click)="goBack()"
            [disabled]="submitting()"
          >
            Back to Programs
          </button>
          <button
            class="btn btn-primary"
            (click)="submitWorkout()"
            [disabled]="submitting()"
          >
            <span *ngIf="!submitting()">✓ Complete Workout</span>
            <span *ngIf="submitting()" class="flex items-center gap-2">
              <span class="animate-spin">⏳</span>
              Saving...
            </span>
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
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 1rem;
        backdrop-filter: blur(4px);
      }

      .confetti-container {
        position: fixed;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1999;
      }

      .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        animation: confetti-fall 3s ease-out forwards;
      }

      @keyframes confetti-fall {
        0% {
          transform: translateY(-10vh) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }

      .confetti:nth-child(1) { background: #ff6b6b; left: 10%; animation-delay: 0s; }
      .confetti:nth-child(2) { background: #4ecdc4; left: 20%; animation-delay: 0.1s; }
      .confetti:nth-child(3) { background: #ffe66d; left: 30%; animation-delay: 0.2s; }
      .confetti:nth-child(4) { background: #95e1d3; left: 40%; animation-delay: 0.3s; }
      .confetti:nth-child(5) { background: #f38181; left: 50%; animation-delay: 0.4s; }
      .confetti:nth-child(6) { background: #aa96da; left: 60%; animation-delay: 0.5s; }
      .confetti:nth-child(7) { background: #fcbad3; left: 70%; animation-delay: 0.6s; }
      .confetti:nth-child(8) { background: #a8d8ea; left: 80%; animation-delay: 0.7s; }
      .confetti:nth-child(9) { background: #ff9a76; left: 90%; animation-delay: 0.8s; }
      .confetti:nth-child(10) { background: #6bcf7f; left: 5%; animation-delay: 0.9s; }
      .confetti:nth-child(11) { background: #ff6b6b; left: 15%; animation-delay: 1s; }
      .confetti:nth-child(12) { background: #4ecdc4; left: 25%; animation-delay: 1.1s; }
      .confetti:nth-child(13) { background: #ffe66d; left: 35%; animation-delay: 1.2s; }
      .confetti:nth-child(14) { background: #95e1d3; left: 45%; animation-delay: 1.3s; }
      .confetti:nth-child(15) { background: #f38181; left: 55%; animation-delay: 1.4s; }
      .confetti:nth-child(16) { background: #aa96da; left: 65%; animation-delay: 1.5s; }
      .confetti:nth-child(17) { background: #fcbad3; left: 75%; animation-delay: 1.6s; }
      .confetti:nth-child(18) { background: #a8d8ea; left: 85%; animation-delay: 1.7s; }
      .confetti:nth-child(19) { background: #ff9a76; left: 12%; animation-delay: 1.8s; }
      .confetti:nth-child(20) { background: #6bcf7f; left: 88%; animation-delay: 1.9s; }

      .completion-modal {
        background: white;
        padding: 2.5rem;
        border-radius: 1.5rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05);
        max-width: 600px;
        width: 100%;
        text-align: center;
        color: #1f2937;
        animation: modalSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .success-icon-wrapper {
        position: relative;
        margin-bottom: 1.5rem;
      }

      .success-icon {
        width: 100px;
        height: 100px;
        margin: 0 auto;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3.5rem;
        font-weight: bold;
        animation: iconPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
      }

      @keyframes iconPulse {
        0% {
          transform: scale(0) rotate(-45deg);
          opacity: 0;
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1) rotate(0deg);
          opacity: 1;
        }
      }

      .motivation-section {
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        margin-bottom: 1.5rem;
        background-clip: padding-box;
        animation: motivationSlide 0.6s ease-out 0.2s backwards;
      }

      @keyframes motivationSlide {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .motivation-text {
        color: white;
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      h2 {
        font-size: 2rem;
        font-weight: 700;
        margin: 1rem 0 0.5rem;
        color: #1f2937;
      }

      .subtitle {
        color: #6b7280;
        margin-bottom: 2rem;
        font-size: 1rem;
      }

      .exercises-summary {
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        padding: 1.5rem;
        border-radius: 1rem;
        margin-bottom: 2rem;
        border: 1px solid #d1d5db;
      }

      .exercises-summary h3 {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: #1f2937;
      }

      .exercises-list {
        max-height: 300px;
        overflow-y: auto;
      }

      .exercises-list::-webkit-scrollbar {
        width: 6px;
      }

      .exercises-list::-webkit-scrollbar-track {
        background: #e5e7eb;
        border-radius: 3px;
      }

      .exercises-list::-webkit-scrollbar-thumb {
        background: #9ca3af;
        border-radius: 3px;
      }

      .exercise-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: white;
        border-radius: 0.75rem;
        margin-bottom: 0.75rem;
        border-left: 4px solid #10b981;
        transition: all 0.2s ease;
        animation: itemFade 0.4s ease backwards;
      }

      @keyframes itemFade {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .exercise-item:hover {
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
      }

      .exercise-left {
        flex: 1;
        text-align: left;
      }

      .exercise-name {
        display: block;
        color: #1f2937;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .exercise-sets {
        color: #9ca3af;
        font-size: 0.875rem;
      }

      .exercise-check {
        color: #10b981;
        font-weight: bold;
        font-size: 1.3rem;
        margin-left: 1rem;
      }

      .notes-form {
        margin-bottom: 2rem;
      }

      .notes-label {
        display: block;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 0.75rem;
        font-size: 0.95rem;
      }

      .notes-textarea {
        width: 100%;
        min-height: 100px;
        padding: 0.875rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        font-family: inherit;
        font-size: 0.95rem;
        resize: vertical;
        background: #f9fafb;
        color: #1f2937;
        transition: all 0.2s ease;
      }

      .notes-textarea:focus {
        outline: none;
        border-color: #10b981;
        background: white;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }

      .notes-textarea::placeholder {
        color: #9ca3af;
      }

      .actions {
        display: flex;
        gap: 1rem;
      }

      .btn {
        flex: 1;
        padding: 1rem 1.5rem;
        border: none;
        border-radius: 0.75rem;
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
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
      }

      .btn-primary:active:not(:disabled) {
        transform: translateY(0);
      }

      .btn-secondary {
        background: #f3f4f6;
        color: #6b7280;
        border: 1px solid #e5e7eb;
      }

      .btn-secondary:hover:not(:disabled) {
        background: #e5e7eb;
        color: #1f2937;
      }

      .error-message {
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        color: #991b1b;
        padding: 1rem;
        border-radius: 0.75rem;
        margin-top: 1rem;
        font-size: 0.95rem;
        border-left: 4px solid #dc2626;
        animation: slideUp 0.3s ease;
      }

      .success-message {
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        color: #166534;
        padding: 1rem;
        border-radius: 0.75rem;
        margin-top: 1rem;
        font-size: 0.95rem;
        border-left: 4px solid #16a34a;
        animation: slideUp 0.3s ease;
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
          padding: 1.75rem 1.5rem;
        }

        h2 {
          font-size: 1.5rem;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          font-size: 2.5rem;
        }

        .actions {
          flex-direction: column;
        }

        .btn {
          padding: 0.875rem 1rem;
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
  motivationalMessage = signal(this.getRandomMotivationalMessage());

  ngOnInit(): void {
    this.loadCompletedExercises();
    // Change motivational message every 5 seconds
    setInterval(() => {
      this.motivationalMessage.set(this.getRandomMotivationalMessage());
    }, 5000);
  }

  private getRandomMotivationalMessage() {
    return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
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
