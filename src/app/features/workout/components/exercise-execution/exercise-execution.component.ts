import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProgramService } from '../../../programs/services/program.service';
import { ExerciseStateService } from '../../../programs/services/exercise-state.service';
import { WorkoutStateService } from '../../services/workout-state.service';
import { WorkoutHistoryService } from '../../services/workout-history.service';

type ExecutionPhase = 'SELECT_REPS' | 'EXECUTING' | 'RESTING' | 'COMPLETED';

interface SetLog {
  setIndex: number;
  repsCompleted: number;
  completedAt: Date;
}

@Component({
  selector: 'app-exercise-execution',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="execution-container">
      @if (exercise()) {
        <!-- REP SELECTION PHASE -->
        @if (currentPhase() === 'SELECT_REPS') {
          <div class="rep-selector-modal">
            <div class="selector-content">
              <p class="selector-title">Set {{ currentSetIndex() }} of {{ totalSets() }}</p>
              <p class="selector-subtitle">Select reps completed</p>
              <div class="rep-buttons">
                @for (rep of repOptions(); track rep) {
                  <button
                    class="rep-option"
                    (click)="selectReps(rep)"
                  >
                    {{ rep }}
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- EXECUTION PHASE -->
        @if (currentPhase() === 'EXECUTING') {
          <div class="execution-phase">
            <div class="video-container">
              @if (exercise().thumbnailUrl) {
                <img [src]="exercise().thumbnailUrl" [alt]="exercise().excersiceName" class="exercise-video" />
              } @else if (exercise().image) {
                <img [src]="exercise().image" [alt]="exercise().excersiceName" class="exercise-video" />
              } @else {
                <div class="video-placeholder">
                  <span>{{ exercise().excersiceName }}</span>
                </div>
              }

              <div class="execution-overlay">
                <h1>{{ exercise().excersiceName }}</h1>
                <p class="set-indicator">Set {{ currentSetIndex() }}/{{ totalSets() }}</p>
              </div>
            </div>

            <div class="execution-bottom">
              <div class="reps-display" [class.pulse]="isTimerRunning()">
                <span class="reps-number">{{ selectedReps() }}</span>
                <span class="reps-unit">x</span>
              </div>

              <div class="execution-timer">
                {{ executionTimeLeft() }}
              </div>

              <div class="execution-buttons">
                <button
                  class="skip-execution-btn"
                  (click)="skipExecutionTimer()"
                  [disabled]="!isTimerRunning()"
                >
                  Skip Timer
                </button>

                @if (!isTimerRunning()) {
                  <button class="save-set-btn" (click)="saveCurrentSet()">
                    <span class="checkmark">✔</span>
                    Save Set
                  </button>
                }
              </div>

              <div class="set-progress">
                @for (setNum of setNumbers(); track setNum) {
                  <div
                    class="progress-dot"
                    [class.completed]="setNum < currentSetIndex()"
                    [class.current]="setNum === currentSetIndex()"
                  >
                    {{ setNum }}
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- REST PHASE -->
        @if (currentPhase() === 'RESTING') {
          <div class="rest-phase">
            <div class="rest-display">
              <p class="rest-label">Rest</p>
              <div class="rest-timer" [class.pulse]="true">{{ restTimeLeft() }}</div>
              <p class="rest-hint">Set {{ currentSetIndex() + 1 }} coming up...</p>
            </div>

            <button class="skip-rest-btn" (click)="skipRest()">
              Skip Rest & Continue
            </button>

            <div class="set-progress">
              @for (setNum of setNumbers(); track setNum) {
                <div
                  class="progress-dot"
                  [class.completed]="setNum < currentSetIndex()"
                  [class.current]="setNum === currentSetIndex()"
                >
                  {{ setNum }}
                </div>
              }
            </div>
          </div>
        }

        <!-- COMPLETION PHASE -->
        @if (currentPhase() === 'COMPLETED') {
          <div class="completion-modal-overlay">
            <div class="completion-modal-card">
              <div class="success-icon">✓</div>
              <h2>Exercise Complete!</h2>
              <p>{{ exercise().excersiceName }}</p>
              <p class="subtitle">All {{ totalSets() }} sets finished</p>
              <p class="stats">
                Total reps: {{ totalRepsCompleted() }}
              </p>
              <button class="btn-continue" (click)="goToNextExercise()">
                Back to Exercises → Continue Next
              </button>
            </div>
          </div>
        }

        <!-- COMPLETION NOTIFICATION -->
        @if (showCompletionNotification()) {
          <div class="completion-notification">
            <div class="notification-content">
              <span class="notification-icon">✓</span>
              <span class="notification-text">{{ exercise().excersiceName }} saved</span>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .execution-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #000;
      overflow: hidden;
    }

    /* REP SELECTION MODAL */
    .rep-selector-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      animation: fadeIn 0.3s ease;
    }

    .selector-content {
      background: #2a2a2a;
      border-radius: 1.5rem;
      padding: 2.5rem;
      max-width: 450px;
      width: 90%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
    }

    .selector-title {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 700;
      color: #667eea;
    }

    .selector-subtitle {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
      color: #aaa;
    }

    .rep-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      width: 100%;
    }

    .rep-option {
      background: #3a3a3a;
      color: white;
      border: 2px solid transparent;
      padding: 1.2rem 0.75rem;
      border-radius: 0.75rem;
      font-size: 1.15rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .rep-option:hover {
      background: #4a4a4a;
      border-color: #667eea;
      transform: scale(1.05);
    }

    .rep-option:active {
      transform: scale(0.95);
    }

    /* EXECUTION PHASE */
    .execution-phase {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .video-container {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      overflow: hidden;
    }

    .exercise-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-size: 2rem;
      font-weight: 700;
      color: white;
      text-align: center;
      padding: 2rem;
    }

    .execution-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.95));
      color: white;
      padding: 3rem 1.5rem 1.5rem;
      text-align: center;
    }

    .execution-overlay h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }

    .set-indicator {
      margin: 0.5rem 0 0;
      font-size: 1rem;
      color: #aaa;
    }

    .execution-bottom {
      background: #1a1a1a;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }

    .reps-display {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .reps-number {
      font-size: 4rem;
      font-weight: 700;
      color: #667eea;
    }

    .reps-unit {
      font-size: 1.5rem;
      color: #aaa;
    }

    .pulse {
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .execution-timer {
      font-size: 3.5rem;
      font-weight: 700;
      color: #00d4ff;
      font-family: monospace;
    }

    .execution-buttons {
      display: flex;
      gap: 1rem;
      width: 100%;
      max-width: 400px;
    }

    .skip-execution-btn {
      flex: 1;
      background: #3a3a3a;
      color: white;
      border: 2px solid #555;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .skip-execution-btn:hover:not(:disabled) {
      background: #4a4a4a;
      border-color: #667eea;
    }

    .skip-execution-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .save-set-btn {
      flex: 1;
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .save-set-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .checkmark {
      margin-right: 0.5rem;
    }

    .set-progress {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .progress-dot {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #3a3a3a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #999;
      transition: all 0.3s;
    }

    .progress-dot.current {
      background: #667eea;
      color: white;
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
    }

    .progress-dot.completed {
      background: #4caf50;
      color: white;
    }

    /* REST PHASE */
    .rest-phase {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      gap: 3rem;
      padding: 2rem;
    }

    .rest-display {
      text-align: center;
    }

    .rest-label {
      color: #aaa;
      font-size: 1.2rem;
      font-weight: 500;
      margin: 0;
    }

    .rest-timer {
      font-size: 6rem;
      font-weight: 700;
      color: #667eea;
      font-family: monospace;
      margin: 1rem 0;
    }

    .rest-hint {
      color: #888;
      font-size: 1rem;
      margin: 0;
    }

    .skip-rest-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2.5rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
    }

    .skip-rest-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
    }

    .skip-rest-btn:active {
      transform: scale(0.95);
    }

    /* COMPLETION PHASE */
    .completion-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      animation: fadeIn 0.3s ease;
    }

    .completion-modal-card {
      background: #2a2a2a;
      border-radius: 1.5rem;
      padding: 3rem 2rem;
      max-width: 420px;
      width: 90%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
      animation: slideUp 0.4s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .success-icon {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5rem;
      font-weight: 700;
      animation: scaleIn 0.5s ease;
      box-shadow: 0 8px 24px rgba(76, 175, 80, 0.3);
    }

    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    .completion-modal-card h2 {
      margin: 0;
      font-size: 1.8rem;
      color: white;
    }

    .completion-modal-card p {
      margin: 0;
      color: #aaa;
      font-size: 1.05rem;
    }

    .subtitle {
      font-size: 0.95rem;
      color: #888;
    }

    .stats {
      font-size: 1rem;
      color: #00d4ff;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .btn-continue {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
      margin-top: 1rem;
    }

    .btn-continue:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    }

    .btn-continue:active {
      transform: scale(0.98);
    }

    /* COMPLETION NOTIFICATION */
    .completion-notification {
      position: fixed;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 200;
      animation: slideDownIn 0.5s ease, slideDownOut 0.5s ease 2.5s forwards;
    }

    .notification-content {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      padding: 1.2rem 2rem;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(76, 175, 80, 0.4);
    }

    .notification-icon {
      font-size: 1.3rem;
      font-weight: 700;
    }

    @keyframes slideDownIn {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    @keyframes slideDownOut {
      from {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      to {
        opacity: 0;
        transform: translateX(-50%) translateY(-30px);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 480px) {
      .selector-content {
        padding: 2rem 1.5rem;
      }

      .rep-option {
        padding: 1rem 0.5rem;
        font-size: 1rem;
      }

      .execution-overlay h1 {
        font-size: 1.5rem;
      }

      .reps-number {
        font-size: 3.5rem;
      }

      .execution-timer {
        font-size: 2.5rem;
      }

      .rest-timer {
        font-size: 4rem;
      }

      .rest-phase {
        gap: 2rem;
      }

      .completion-modal-card {
        padding: 2rem 1.5rem;
      }

      .success-icon {
        width: 80px;
        height: 80px;
        font-size: 2.5rem;
      }

      .completion-modal-card h2 {
        font-size: 1.4rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseExecutionComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private programService = inject(ProgramService);
  private exerciseStateService = inject(ExerciseStateService);
  private workoutStateService = inject(WorkoutStateService);
  private workoutHistoryService = inject(WorkoutHistoryService);
  private destroy$ = new Subject<void>();

  exercise = signal<any>(null);
  currentPhase = signal<ExecutionPhase>('SELECT_REPS');
  currentSetIndex = signal(1);
  selectedReps = signal<number | null>(null);
  executionTimeLeft = signal(30);
  restTimeLeft = signal(60);
  isTimerRunning = signal(false);
  setsLog = signal<SetLog[]>([]);
  showCompletionNotification = signal(false);

  private timerSubscription: Subscription | null = null;

  totalSets = computed(() => {
    const ex = this.exercise();
    return ex ? Number(ex.sets) || 3 : 3;
  });

  repOptions = computed(() => {
    const ex = this.exercise();
    if (!ex) return [];
    const reps = String(ex.reps || '');
    const match = reps.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      const min = parseInt(match[1], 10);
      const max = parseInt(match[2], 10);
      const opts: number[] = [];
      for (let i = min; i <= max; i++) opts.push(i);
      return opts;
    }
    const single = parseInt(reps, 10);
    return isNaN(single) ? [] : [single];
  });

  setNumbers = computed(() => {
    const total = this.totalSets();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  totalRepsCompleted = computed(() => {
    return this.setsLog().reduce((sum, log) => sum + log.repsCompleted, 0);
  });

  ngOnInit(): void {
    this.restorePersistedState();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const exerciseId = Number(params['exerciseId']);
      this.loadExercise(exerciseId);
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadExercise(exerciseId: number): void {
    const savedExercise = this.exerciseStateService.getCurrentExercise();
    if (savedExercise) {
      this.exercise.set(savedExercise);
      return;
    }

    const dayId = this.route.snapshot.queryParams['dayId'];
    if (dayId) {
      this.programService.getExercisesByDayId(Number(dayId))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (day: any) => {
            const found = day.exercises?.find((e: any) => e.id === exerciseId || e.exerciseId === exerciseId);
            if (found) {
              this.exercise.set(found);
            }
          }
        });
    }
  }

  selectReps(reps: number): void {
    this.selectedReps.set(reps);
    this.startExecutionTimer();
  }

  private startExecutionTimer(): void {
    this.currentPhase.set('EXECUTING');
    this.isTimerRunning.set(true);
    const timerDuration = Math.ceil((this.selectedReps() || 10) / 2);
    this.executionTimeLeft.set(timerDuration);

    this.clearTimer();
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.executionTimeLeft.update((v) => {
          if (v <= 1) {
            this.isTimerRunning.set(false);
            this.clearTimer();
            return 0;
          }
          return v - 1;
        });
      });
  }

  skipExecutionTimer(): void {
    this.executionTimeLeft.set(0);
    this.isTimerRunning.set(false);
    this.clearTimer();
  }

  saveCurrentSet(): void {
    const reps = this.selectedReps();
    if (!reps) return;

    const setLog: SetLog = {
      setIndex: this.currentSetIndex(),
      repsCompleted: reps,
      completedAt: new Date()
    };

    this.setsLog.update((logs) => [...logs, setLog]);
    this.workoutStateService.logSetCompletion(
      this.exercise().exerciseId ?? this.exercise().id,
      this.currentSetIndex(),
      reps
    );

    if (this.currentSetIndex() < this.totalSets()) {
      this.startRestTimer();
    } else {
      this.completeExercise();
    }
  }

  private startRestTimer(): void {
    this.currentPhase.set('RESTING');
    const restSeconds = this.exercise().restSeconds || 60;
    this.restTimeLeft.set(restSeconds);

    this.clearTimer();
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.restTimeLeft.update((v) => {
          if (v <= 1) {
            this.clearTimer();
            this.goToNextSet();
            return 0;
          }
          return v - 1;
        });
      });
  }

  skipRest(): void {
    this.restTimeLeft.set(0);
    this.clearTimer();
    this.goToNextSet();
  }

  private goToNextSet(): void {
    this.currentSetIndex.update((idx) => idx + 1);
    this.selectedReps.set(null);
    this.currentPhase.set('SELECT_REPS');
  }

  private completeExercise(): void {
    const exerciseId = this.exercise().exerciseId ?? this.exercise().id;
    const session = this.workoutStateService.session();
    const durationSeconds = session
      ? Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)
      : 0;

    this.workoutStateService.completeExercise(exerciseId, durationSeconds);
    this.persistExerciseCompletion(exerciseId);
    this.currentPhase.set('COMPLETED');
    this.showCompletionNotificationBriefly();
  }

  private persistExerciseCompletion(exerciseId: number): void {
    const dayId = this.route.snapshot.queryParams['dayId'];
    if (!dayId) return;

    const storageKey = `workout_day_${dayId}`;
    const existingData = localStorage.getItem(storageKey);
    const workoutData = existingData ? JSON.parse(existingData) : {};

    if (!workoutData.completedExercises) {
      workoutData.completedExercises = [];
    }
    if (!workoutData.completedExercises.includes(exerciseId)) {
      workoutData.completedExercises.push(exerciseId);
    }

    workoutData.exercises = workoutData.exercises || {};
    workoutData.exercises[exerciseId] = {
      exerciseName: this.exercise().excersiceName || this.exercise().exerciseName,
      sets: this.setsLog(),
      completedAt: new Date().toISOString()
    };

    localStorage.setItem(storageKey, JSON.stringify(workoutData));
  }

  private restorePersistedState(): void {
    const dayId = this.route.snapshot.queryParams['dayId'];
    if (!dayId) return;

    const storageKey = `workout_day_${dayId}`;
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const workoutData = JSON.parse(savedData);
        if (workoutData.completedExercises && workoutData.completedExercises.length > 0) {
          const currentExerciseId = Number(this.route.snapshot.params['exerciseId']);
          if (workoutData.completedExercises.includes(currentExerciseId)) {
            this.currentPhase.set('COMPLETED');
            if (workoutData.exercises && workoutData.exercises[currentExerciseId]) {
              this.setsLog.set(workoutData.exercises[currentExerciseId].sets);
            }
          }
        }
      } catch (e) {
        console.error('Failed to restore workout state', e);
      }
    }
  }

  private showCompletionNotificationBriefly(): void {
    this.showCompletionNotification.set(true);
    setTimeout(() => {
      this.showCompletionNotification.set(false);
    }, 3000);
  }

  goToNextExercise(): void {
    const session = this.workoutStateService.session();
    if (!session) {
      this.router.navigate(['/programs']);
      return;
    }

    const currentExerciseId = this.exercise().exerciseId ?? this.exercise().id;
    const currentIndex = session.exercises.findIndex((e) => e.exerciseId === currentExerciseId);

    console.log(`✅ Exercise ${currentIndex + 1} of ${session.exercises.length} completed`);
    console.log(`📋 Current Exercise ID: ${currentExerciseId}`);

    const nextIndex = currentIndex + 1;
    const dayId = this.route.snapshot.queryParams['dayId'];
    const programId = this.route.snapshot.queryParams['programId'];

    if (nextIndex < session.exercises.length) {
      // There is a next exercise
      const nextExerciseId = session.exercises[nextIndex].exerciseId;

      console.log(`➡️ Moving to Exercise ${nextIndex + 1}/${session.exercises.length}`);
      console.log(`📍 Next Exercise ID: ${nextExerciseId}`);
      console.log(`⏱️ Returning to day page, auto-start in 10 seconds...`);

      // Navigate back to day page with autoStart flag
      this.router.navigate(['/programs', programId, 'days', dayId], {
        queryParams: { autoStart: 'true' }
      });
    } else {
      // This was the last exercise
      console.log(`⏹️ LAST EXERCISE COMPLETED! (${currentIndex + 1} of ${session.exercises.length})`);
      console.log(`🔄 Initiating workout finalization...`);
      this.finalizeWorkout();
    }
  }

  private async finalizeWorkout(): Promise<void> {
    try {
      console.log('🏋️ ALL EXERCISES COMPLETED - FINALIZING WORKOUT');
      const session = this.workoutStateService.session();
      console.log('📊 Workout Summary:', {
        totalExercises: session?.exercises.length,
        completedExercises: session?.completedExerciseIds.length,
        startedAt: session?.startedAt
      });

      // Submit the completed workout
      console.log('📤 Submitting workout to backend...');
      await this.workoutStateService.submitWorkoutLog();
      console.log('✅ Workout submitted successfully!');

      // Save to frontend history AFTER successful API call
      if (session) {
        const dayId = session.programDayId;
        const numberOfExercises = session.exercises.length;

        // Calculate actual duration
        const endTime = new Date();
        let durationMinutes = Math.floor((endTime.getTime() - new Date(session.startedAt).getTime()) / 60000);

        // Apply defensive clamping (same as backend validation)
        const MIN_DURATION = 1;
        const MAX_DURATION = 600;
        if (durationMinutes < MIN_DURATION) {
          durationMinutes = MIN_DURATION;
        } else if (durationMinutes > MAX_DURATION) {
          durationMinutes = MAX_DURATION;
        }

        // Get day name (fallback to generic name)
        let dayName = `Day ${dayId}`;
        try {
          const queryDayId = this.route.snapshot.queryParams['dayId'];
          if (queryDayId) {
            const dayData = await this.programService.getExercisesByDayId(Number(queryDayId)).toPromise();
            if (dayData?.title) {
              dayName = dayData.title;
            }
          }
        } catch (e) {
          console.warn('Could not fetch day name, using default');
        }

        // Save to workout history
        this.workoutHistoryService.saveCompletedWorkout(
          dayId,
          dayName,
          numberOfExercises,
          durationMinutes
        );
        console.log('📝 Workout saved to history');
      }

      // Clear the workout session
      this.workoutStateService.clearWorkout();
      console.log('🧹 Workout session cleared');

      // Navigate to completion page
      const dayId = this.route.snapshot.queryParams['dayId'];
      const programId = this.route.snapshot.queryParams['programId'];

      console.log('🎉 WORKOUT DAY COMPLETED SUCCESSFULLY!');
      console.log('📍 Navigating to:', `/programs/${programId}/days/${dayId}?completed=true`);

      if (programId && dayId) {
        this.router.navigate(['/programs', programId, 'days', dayId], {
          queryParams: { completed: 'true' }
        });
      } else {
        this.router.navigate(['/programs']);
      }
    } catch (error) {
      console.error('❌ Error finalizing workout:', error);
      this.router.navigate(['/programs']);
    }
  }

  private clearTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }
}
