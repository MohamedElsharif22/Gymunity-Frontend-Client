import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgramService } from '../../programs/services/program.service';
import { WorkoutExecutionStateService, ExecutedExercise } from '../../programs/services/workout-execution-state.service';
import { WorkoutLogService, WorkoutLogRequest } from '../../programs/services/workout-log.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, interval } from 'rxjs';

@Component({
  selector: 'app-workout-execute',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workout-execute.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideRight {
      from { width: 0; }
      to { width: 100%; }
    }

    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    :host ::ng-deep {
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }

      .animate-slideDown {
        animation: slideDown 0.5s ease-out forwards;
        opacity: 0;
      }

      .animate-slideUp {
        animation: slideUp 0.5s ease-out forwards;
        opacity: 0;
      }

      .animate-slideRight {
        animation: slideRight 0.8s ease-in-out;
      }

      .animate-popIn {
        animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        opacity: 0;
      }

      .animate-scaleIn {
        animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .animate-bounceIn {
        animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    }
  `]
})
export class WorkoutExecuteComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private programService = inject(ProgramService);
  private workoutExecutionStateService = inject(WorkoutExecutionStateService);
  private workoutLogService = inject(WorkoutLogService);
  private destroy$ = new Subject<void>();

  Math = Math;

  // UI state
  exercise = signal<any | null>(null);
  exerciseId!: number;
  isLoading = signal(false);

  // Execution signals
  executionStarted = signal(false);
  executionCompleted = signal(false);
  currentSet = signal(1);
  totalSets = signal(0);
  repOptions = signal<number[]>([]);
  selectedReps = signal<number | null>(null);
  remainingReps = signal(0);
  counterActive = signal(false);
  isResting = signal(false);
  restRemaining = signal(0);
  completedSets = signal<number[]>([]);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('exerciseId');
    this.exerciseId = idParam ? parseInt(idParam, 10) : 0;

    if (!this.exerciseId) {
      this.router.navigate(['/workout/day']);
      return;
    }

    this.isLoading.set(true);
    this.programService.getExerciseById(this.exerciseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ex) => {
          this.exercise.set(ex);
          this.isLoading.set(false);
        },
        error: () => {
          this.exercise.set(null);
          this.isLoading.set(false);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startExecution() {
    const ex = this.exercise();
    if (!ex) return;

    const sets = parseInt(ex.sets, 10) || 3;
    this.totalSets.set(sets);
    this.currentSet.set(1);
    this.completedSets.set([]);

    const repsOptions = this.parseRepsRange(ex.reps);
    this.repOptions.set(repsOptions);

    this.executionStarted.set(true);
    this.executionCompleted.set(false);
  }

  parseRepsRange(repsStr: string): number[] {
    const cleaned = (repsStr || '').replace(/x/gi, '').trim();
    const range = cleaned.match(/(\d+)\s*-\s*(\d+)/);

    if (range) {
      const min = parseInt(range[1], 10);
      const max = parseInt(range[2], 10);
      const opts: number[] = [];
      for (let i = min; i <= max; i++) opts.push(i);
      return opts;
    }

    const single = parseInt(cleaned, 10);
    return isNaN(single) ? [] : [single];
  }

  selectReps(reps: number) {
    this.selectedReps.set(reps);
    this.remainingReps.set(reps);
    this.counterActive.set(true);
  }

  tapCounter() {
    const remaining = this.remainingReps();
    if (remaining <= 0) return;

    const newRemaining = remaining - 1;
    this.remainingReps.set(newRemaining);

    if (newRemaining === 0) {
      this.counterActive.set(false);
      const completed = this.completedSets();
      completed.push(this.selectedReps()!);
      this.completedSets.set([...completed]);
      this.startRest();
    }
  }

  startRest() {
    const ex = this.exercise();
    if (!ex) return;

    const restSeconds = ex.restSeconds || 60;
    this.isResting.set(true);
    this.restRemaining.set(restSeconds);

    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      const remaining = this.restRemaining();
      if (remaining <= 1) {
        this.isResting.set(false);
        this.restRemaining.set(0);
      } else {
        this.restRemaining.set(remaining - 1);
      }
    });
  }

  nextSet() {
    const current = this.currentSet();
    const total = this.totalSets();

    if (current < total) {
      this.currentSet.set(current + 1);
      this.selectedReps.set(null);
      this.remainingReps.set(0);
      this.counterActive.set(false);
    } else {
      this.completeExecution();
    }
  }

  getTotalReps(): number {
    return this.completedSets().reduce((sum, reps) => sum + reps, 0);
  }

  completeExecution() {
    this.executionCompleted.set(true);

    const result: ExecutedExercise = {
      exerciseId: this.exerciseId,
      exerciseName: this.exercise()?.excersiceName || '',
      setsCompleted: this.completedSets().length,
      repsPerSet: this.completedSets(),
      totalReps: this.getTotalReps(),
      completed: true
    };

    console.log('Exercise Execution Result:', result);
    this.workoutExecutionStateService.addExecutedExercise(result);

    this.saveWorkoutLog();
  }

  saveWorkoutLog() {
    const programDayId = this.workoutExecutionStateService.getProgramDayId();
    const executedExercises = this.workoutExecutionStateService.getExecutedExercises();
    const durationMinutes = this.workoutExecutionStateService.getDurationMinutes();

    if (!programDayId) {
      console.error('No program day ID available');
      return;
    }

    const payload: WorkoutLogRequest = {
      ProgramDayId: programDayId,
      CompletedAt: new Date().toISOString(),
      Notes: undefined,
      DurationMinutes: durationMinutes,
      ExercisesLoggedJson: JSON.stringify(executedExercises)
    };

    console.log('Saving workout log:', payload);

    this.workoutLogService.saveWorkoutLog(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Workout logged successfully:', response);
        this.workoutExecutionStateService.reset();
        this.router.navigate(['/workout/day']);
      },
      error: (err) => {
        console.error('Error saving workout log:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/workout/day']);
  }
}
