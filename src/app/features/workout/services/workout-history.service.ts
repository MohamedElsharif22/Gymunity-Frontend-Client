import { Injectable, signal, computed } from '@angular/core';

export interface CompletedWorkout {
  programDayId: number;
  programDayName: string;
  numberOfExercises: number;
  completedAt: string; // ISO string
  durationMinutes: number;
}

export interface WorkoutStats {
  currentStreak: number;
  totalWorkouts: number;
  totalProgramDays: number;
  lastWorkoutDate: string | null;
  totalDurationMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutHistoryService {
  private readonly STORAGE_KEY = 'workout_history';
  private readonly STREAK_KEY = 'workout_streak';

  // Signal to track workout history changes
  private workoutHistory = signal<CompletedWorkout[]>([]);
  private currentStreak = signal<number>(0);

  // Expose as read-only signals
  readonly history = this.workoutHistory.asReadonly();
  readonly streak = this.currentStreak.asReadonly();

  // Computed stats derived from history
  readonly stats = computed<WorkoutStats>(() => {
    const workouts = this.workoutHistory();
    const uniqueDays = new Set(workouts.map(w => w.programDayId)).size;
    const totalDuration = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);
    const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1].completedAt : null;

    return {
      currentStreak: this.currentStreak(),
      totalWorkouts: workouts.length,
      totalProgramDays: uniqueDays,
      lastWorkoutDate: lastWorkout,
      totalDurationMinutes: totalDuration
    };
  });

  constructor() {
    this.loadHistoryFromStorage();
    this.recalculateStreak();
  }

  /**
   * Save a completed workout to localStorage
   */
  saveCompletedWorkout(
    programDayId: number,
    programDayName: string,
    numberOfExercises: number,
    durationMinutes: number
  ): void {
    const completedAt = new Date().toISOString();

    const newWorkout: CompletedWorkout = {
      programDayId,
      programDayName,
      numberOfExercises,
      completedAt,
      durationMinutes
    };

    this.workoutHistory.update(history => {
      // Add new workout, keep newest first
      return [newWorkout, ...history];
    });

    this.persistToStorage();
    this.recalculateStreak();

    console.log(`📝 Workout saved to history: Day ${programDayId} (${durationMinutes} min)`);
  }

  /**
   * Check if a specific program day has a completed workout
   */
  isDayCompleted(programDayId: number): boolean {
    return this.workoutHistory().some(w => w.programDayId === programDayId);
  }

  /**
   * Get the most recent completion date for a program day
   */
  getLastCompletionDate(programDayId: number): string | null {
    const workout = this.workoutHistory().find(w => w.programDayId === programDayId);
    return workout ? workout.completedAt : null;
  }

  /**
   * NEW: Get completed exercises for a specific day from workout log
   * Returns array of exerciseIds that were completed
   */
  getCompletedExercisesForDay(programDayId: number): number[] {
    const workout = this.workoutHistory().find(w => w.programDayId === programDayId);
    if (!workout) return [];

    try {
      // Parse the exercises log stored in localStorage/backend
      const exerciseLog = JSON.parse(localStorage.getItem(`workout_exercises_${programDayId}`) || '[]');
      return exerciseLog.map((ex: any) => ex.exerciseId);
    } catch (error) {
      console.error('Error parsing exercise log:', error);
      return [];
    }
  }

  /**
   * Calculate and update the workout streak
   * Streak = consecutive calendar days with at least one completed workout
   */
  private recalculateStreak(): void {
    const workouts = this.workoutHistory();

    if (workouts.length === 0) {
      this.currentStreak.set(0);
      this.persistStreakToStorage(0);
      return;
    }

    // Get unique dates (normalized to calendar days)
    const uniqueDates = new Set<string>();
    workouts.forEach(w => {
      const date = this.getCalendarDate(w.completedAt);
      uniqueDates.add(date);
    });

    // Sort dates in descending order (newest first)
    const sortedDates = Array.from(uniqueDates).sort().reverse();

    if (sortedDates.length === 0) {
      this.currentStreak.set(0);
      this.persistStreakToStorage(0);
      return;
    }

    // Check if most recent workout is today or yesterday
    const today = this.getCalendarDate(new Date().toISOString());
    const yesterday = this.getYesterday(today);
    const mostRecentDate = sortedDates[0];

    // If the most recent workout is neither today nor yesterday, streak is 0 or 1
    if (mostRecentDate !== today && mostRecentDate !== yesterday) {
      // Only count as streak=1 if it's today
      const streak = mostRecentDate === today ? 1 : 0;
      this.currentStreak.set(streak);
      this.persistStreakToStorage(streak);
      return;
    }

    // Count consecutive days starting from today/yesterday
    let streak = 1;
    let currentDate = mostRecentDate;

    for (let i = 1; i < sortedDates.length; i++) {
      const previousDate = sortedDates[i];
      const expectedPreviousDate = this.getYesterday(currentDate);

      if (previousDate === expectedPreviousDate) {
        streak++;
        currentDate = previousDate;
      } else {
        break;
      }
    }

    this.currentStreak.set(streak);
    this.persistStreakToStorage(streak);

    console.log(`🔥 Streak recalculated: ${streak} days`);
  }

  /**
   * Normalize date to calendar date (YYYY-MM-DD)
   */
  private getCalendarDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get yesterday's date in YYYY-MM-DD format
   */
  private getYesterday(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Persist workout history to localStorage
   */
  private persistToStorage(): void {
    try {
      const data = JSON.stringify(this.workoutHistory());
      localStorage.setItem(this.STORAGE_KEY, data);
      console.log('💾 Workout history persisted to localStorage');
    } catch (error) {
      console.error('Failed to persist workout history:', error);
    }
  }

  /**
   * Persist streak to localStorage
   */
  private persistStreakToStorage(streak: number): void {
    try {
      localStorage.setItem(this.STREAK_KEY, JSON.stringify(streak));
    } catch (error) {
      console.error('Failed to persist streak:', error);
    }
  }

  /**
   * Load workout history from localStorage
   */
  private loadHistoryFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const history = JSON.parse(data) as CompletedWorkout[];
        // Sort by date, newest first
        history.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        this.workoutHistory.set(history);
        console.log(`📚 Loaded ${history.length} workouts from localStorage`);
      }
    } catch (error) {
      console.error('Failed to load workout history from localStorage:', error);
      this.workoutHistory.set([]);
    }
  }

  /**
   * Load streak from localStorage
   */
  private loadStreakFromStorage(): number {
    try {
      const data = localStorage.getItem(this.STREAK_KEY);
      if (data) {
        return JSON.parse(data) as number;
      }
    } catch (error) {
      console.error('Failed to load streak from localStorage:', error);
    }
    return 0;
  }

  /**
   * Clear all workout history (for testing/reset purposes)
   */
  clearHistory(): void {
    this.workoutHistory.set([]);
    this.currentStreak.set(0);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STREAK_KEY);
    console.log('🗑️ Workout history cleared');
  }
}
