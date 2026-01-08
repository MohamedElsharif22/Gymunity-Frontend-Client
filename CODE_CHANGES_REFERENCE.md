# Code Changes Reference

## File 1: program-day-detail.component.ts

### Change 1: Updated Component Signals

**Location**: Lines ~280-380

**NEW SIGNALS ADDED**:

```typescript
/**
 * Get completed exercise IDs from:
 * 1. Active workout session (if exists)
 * 2. localStorage (persistent, survives reload)
 */
completedExerciseIds = computed(() => {
  // First check if there's an active session with completed exercises
  const session = this.workoutStateService.session();
  if (session && session.completedExerciseIds && session.completedExerciseIds.length > 0) {
    return session.completedExerciseIds;
  }

  // Fall back to reading from localStorage (survives page reload)
  const storageKey = `workout_day_${this.dayId}`;
  const savedData = localStorage.getItem(storageKey);
  if (savedData) {
    try {
      const workoutData = JSON.parse(savedData);
      if (workoutData.completedExercises && Array.isArray(workoutData.completedExercises)) {
        return workoutData.completedExercises;
      }
    } catch (e) {
      console.warn('Failed to parse completed exercises from localStorage:', e);
    }
  }

  return [];
});

/**
 * Computed: Get completed exercises for the day
 */
completedExercisesForDay = computed(() => {
  const completedIds = this.completedExerciseIds();
  return this.exercises().filter(ex => completedIds.includes(ex.exerciseId));
});

/**
 * Computed: Get the next exercise to execute
 */
nextExerciseToExecute = computed(() => {
  const completed = this.completedExerciseIds();
  const next = this.exercises().find(ex => !completed.includes(ex.exerciseId));
  return next || null;
});
```

### Change 2: Updated startWorkout() Method

**BEFORE**:
```typescript
startWorkout() {
  const exercisesData = this.exercises().map((ex: any) => ({
    id: ex.exerciseId ?? ex.id,
    sets: Number(ex.sets),
    reps: ex.reps
  }));

  const completedIds = this.completedExerciseIds();

  // إذا كان هناك تمارين مكتملة → عرض modal Resume
  if (completedIds.length > 0 && completedIds.length < exercisesData.length) {
    this.showResumeModal.set(true);
    this.startResumeCountdown();
    return;
  }

  // Initialize workout
  this.workoutStateService.initializeWorkout(this.dayId, exercisesData);

  // Navigate to first exercise
  if (exercisesData.length > 0) {
    const firstExerciseId = exercisesData[0].id;
    this.router.navigate(['/exercise', firstExerciseId, 'execute'], {
      queryParams: { dayId: this.dayId, programId: this.programId }
    });
  }
}
```

**AFTER**:
```typescript
startWorkout() {
  // Show the progress modal
  this.showStartWorkoutModal.set(true);
}
```

### Change 3: Added proceedWithWorkout() Method

**NEW METHOD**:
```typescript
/**
 * Called when user clicks "Continue Workout" in the modal
 */
proceedWithWorkout() {
  const exercisesData = this.exercises().map((ex: any) => ({
    id: ex.exerciseId ?? ex.id,
    sets: Number(ex.sets),
    reps: ex.reps
  }));

  const completedIds = this.completedExerciseIds();

  // Initialize the workout session with all exercises (in case user starts from scratch)
  // This will include completedExerciseIds in the session
  this.workoutStateService.initializeWorkout(this.dayId, exercisesData, completedIds);

  // Get the next exercise to execute
  const nextExercise = this.nextExerciseToExecute();
  if (nextExercise) {
    // Close modal and navigate to next exercise
    this.showStartWorkoutModal.set(false);
    this.router.navigate(['/exercise', nextExercise.exerciseId, 'execute'], {
      queryParams: { dayId: this.dayId, programId: this.programId }
    });
  }
}

cancelStartWorkout() {
  this.showStartWorkoutModal.set(false);
}
```

### Change 4: Added Modal State Signal

**LOCATION**: After existing signals

```typescript
// Modals
showResumeModal = signal(false);
showStartWorkoutModal = signal(false);  // ← NEW
resumeCountdown = signal(10);
```

### Change 5: Added Helper Methods

**NEW METHODS**:
```typescript
/**
 * Get completed exercises list for modal
 */
getCompletedExercises(): Exercise[] {
  return this.completedExercisesForDay();
}

/**
 * Get remaining (not completed) exercises list for modal
 */
getRemainingExercises(): Exercise[] {
  const completed = this.completedExerciseIds();
  return this.exercises().filter(ex => !completed.includes(ex.exerciseId));
}

/**
 * Get the index (position) of an exercise in the exercises list
 */
getExerciseIndex(exerciseId: number): number {
  const index = this.exercises().findIndex(ex => ex.exerciseId === exerciseId);
  return index >= 0 ? index + 1 : 0;
}
```

### Change 6: Updated Template - Added Modal Before Loading State

**LOCATION**: Top of the content section (before `<!-- Loading State -->`)

```html
<!-- Start Workout Progress Modal -->
@if (showStartWorkoutModal()) {
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-sky-600 to-indigo-600 px-8 py-6 text-white">
        <h2 class="text-3xl font-bold mb-2">Workout Progress</h2>
        <p class="text-sky-100">{{ completedCount() }} of {{ exercises().length }} exercises completed</p>
      </div>

      <!-- Modal Content -->
      <div class="p-8">
        <!-- Completion Summary -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Progress</h3>
            <span class="text-3xl font-bold text-orange-600">{{ (completedCount() / exercises().length * 100 | number:'1.0-0') || 0 }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all" [style.width.%]="(completedCount() / exercises().length * 100 || 0)"></div>
          </div>
        </div>

        <!-- Completed Exercises -->
        @if (completedExercisesForDay().length > 0) {
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Completed Exercises
            </h3>
            <div class="space-y-2">
              @for (exercise of getCompletedExercises(); track exercise.exerciseId) {
                <div class="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
                  <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-900 font-semibold">{{ exercise.excersiceName }}</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Next Exercise -->
        @if (nextExerciseToExecute(); as next) {
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              Next Exercise
            </h3>
            <div class="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
              <p class="text-blue-900 font-bold text-lg">{{ next.excersiceName }}</p>
              <p class="text-blue-700 text-sm mt-1">
                {{ getExerciseIndex(next.exerciseId) }} of {{ exercises().length }}
              </p>
            </div>
          </div>
        } @else {
          <div class="mb-8 bg-green-50 border-2 border-green-400 rounded-lg p-4">
            <p class="text-green-900 font-bold text-lg">✓ Workout already completed!</p>
          </div>
        }

        <!-- Remaining Exercises -->
        @if (getRemainingExercises().length > 0) {
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Remaining Exercises ({{ getRemainingExercises().length }})</h3>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              @for (exercise of getRemainingExercises(); track exercise.exerciseId) {
                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span class="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold text-sm">{{ getExerciseIndex(exercise.exerciseId) }}</span>
                  <span class="text-gray-700">{{ exercise.excersiceName }}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Modal Footer -->
      <div class="bg-gray-50 px-8 py-4 border-t border-gray-200 flex gap-3">
        <button
          (click)="cancelStartWorkout()"
          class="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        @if (nextExerciseToExecute()) {
          <button
            (click)="proceedWithWorkout()"
            class="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition shadow-lg"
          >
            Continue Workout
          </button>
        }
      </div>
    </div>
  </div>
}
```

---

## File 2: workout-state.service.ts

### Change 1: Updated initializeWorkout() Signature

**LOCATION**: Lines ~33-50

**BEFORE**:
```typescript
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
```

**AFTER**:
```typescript
initializeWorkout(
  programDayId: number,
  exercises: Array<{ id: number; sets: number; reps: string }>,
  completedExerciseIds?: number[]
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
    completedExerciseIds: completedExerciseIds || []
  });
}
```

---

## Summary of Changes

| File | Method | Type | Purpose |
|------|--------|------|---------|
| program-day-detail.component.ts | completedExerciseIds | NEW Signal (computed) | Read completed exercises from session or localStorage |
| program-day-detail.component.ts | completedExercisesForDay | NEW Signal (computed) | Get Exercise objects for completed exercises |
| program-day-detail.component.ts | nextExerciseToExecute | NEW Signal (computed) | Get first uncompleted exercise |
| program-day-detail.component.ts | startWorkout | MODIFIED | Show modal instead of navigating |
| program-day-detail.component.ts | proceedWithWorkout | NEW Method | Handle "Continue Workout" button click |
| program-day-detail.component.ts | cancelStartWorkout | NEW Method | Handle "Cancel" button click |
| program-day-detail.component.ts | getCompletedExercises | NEW Method | Helper for modal template |
| program-day-detail.component.ts | getRemainingExercises | NEW Method | Helper for modal template |
| program-day-detail.component.ts | getExerciseIndex | NEW Method | Helper for modal template |
| program-day-detail.component.ts | showStartWorkoutModal | NEW Signal | Track modal visibility |
| program-day-detail.component.ts | Template | MODIFIED | Added new modal section |
| workout-state.service.ts | initializeWorkout | MODIFIED | Accept optional completedExerciseIds parameter |

---

## No Changes Required (Working Correctly)

✅ `ExerciseExecutionComponent`:
- Already saves completed exercises to localStorage via `persistExerciseCompletion()`
- Already reads from localStorage via `restorePersistedState()`
- Already uses correct storage key format: `workout_day_${dayId}`

✅ `WorkoutHistoryService`:
- No changes needed
- Used for day-level completion tracking (separate from exercise-level)

---

## Lines Changed

**program-day-detail.component.ts**:
- Added ~100 lines of new computed signals and methods
- Added ~150 lines of new modal template
- Modified: `startWorkout()` method (simplified from ~25 lines to 2 lines)
- **Total new/modified**: ~250 lines

**workout-state.service.ts**:
- Modified: `initializeWorkout()` method signature and implementation
- **Total changed**: 3 lines (method signature + 1 parameter)

**Grand Total**: ~253 lines changed across 2 files

---

## Testing the Changes

See `WORKOUT_RESUME_QUICK_TEST.md` for detailed testing instructions.

Quick smoke test:
1. Complete 2-3 exercises
2. Reload page (F5)
3. Verify ✔️ badges show
4. Click "Start Workout"
5. Verify modal shows completed exercises
6. Click "Continue Workout"
7. Verify navigation to correct (next uncompleted) exercise
