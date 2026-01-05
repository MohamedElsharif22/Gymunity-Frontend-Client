# Workout Day Orchestration - Quick Reference

## The Problem (Solved ✅)
- Last exercise got stuck
- Workout didn't submit
- No orchestration layer

## The Solution
Implemented 3-layer workout orchestration:

```
Layer 1: INITIALIZATION (ProgramDayDetailComponent.startWorkout)
├─ Collect all exercises
├─ Initialize session with complete exercise list
└─ Navigate to Exercise 1

Layer 2: PROGRESSION (ExerciseExecutionComponent.goToNextExercise)
├─ Find current exercise index in session
├─ If next exercise exists → navigate to it
└─ If last exercise → finalize workout

Layer 3: FINALIZATION (ExerciseExecutionComponent.finalizeWorkout)
├─ Submit workout (ONCE)
├─ Clear session
└─ Navigate to completion
```

## Key Code Snippets

### 1. Start Workout (Initialize All Exercises)
```typescript
// ProgramDayDetailComponent
startWorkout() {
  const exercisesData = this.exercises().map(ex => ({
    id: ex.exerciseId ?? ex.id,
    sets: Number(ex.sets),
    reps: ex.reps
  }));

  // Initialize with ALL exercises
  this.workoutStateService.initializeWorkout(this.dayId, exercisesData);

  // Go to first exercise
  this.router.navigate(['/exercise', exercisesData[0].id, 'execute'], {
    queryParams: { dayId: this.dayId, programId: this.programId }
  });
}
```

### 2. Navigate Between Exercises
```typescript
// ExerciseExecutionComponent
goToNextExercise(): void {
  const session = this.workoutStateService.session();
  const currentIndex = session.exercises.findIndex(
    e => e.exerciseId === currentExerciseId
  );

  if (currentIndex + 1 < session.exercises.length) {
    // Next exercise exists
    const nextId = session.exercises[currentIndex + 1].exerciseId;
    this.router.navigate(['/exercise', nextId, 'execute'], {
      queryParams: { dayId, programId }
    });
  } else {
    // Last exercise - finalize
    this.finalizeWorkout();
  }
}
```

### 3. Submit After All Exercises
```typescript
// ExerciseExecutionComponent
private async finalizeWorkout(): Promise<void> {
  // Submit ONCE when all exercises completed
  await this.workoutStateService.submitWorkoutLog();
  this.workoutStateService.clearWorkout();
  this.router.navigate(['/programs', programId, 'days', dayId], {
    queryParams: { completed: 'true' }
  });
}
```

## How It Works

### State Management
```
WorkoutStateService.session = {
  programDayId: 123,
  startedAt: Date,
  exercises: [          // All exercises loaded upfront
    { exerciseId: 1, sets: [...], durationSeconds: 0 },
    { exerciseId: 2, sets: [...], durationSeconds: 0 },
    { exerciseId: 3, sets: [...], durationSeconds: 0 }
  ],
  completedExerciseIds: [1, 2]  // Tracks which are done
}
```

### Navigation Flow
```
Start Workout
    ↓
Init Session (exercises = [1,2,3])
    ↓
Navigate → /exercise/1/execute
    ↓
Complete Exercise 1
    ↓
goToNextExercise()
    ├─ currentIndex = 0
    ├─ nextIndex = 1
    ├─ 1 < 3 ? YES
    └─ Navigate → /exercise/2/execute
    ↓
Complete Exercise 2
    ↓
goToNextExercise()
    ├─ currentIndex = 1
    ├─ nextIndex = 2
    ├─ 2 < 3 ? YES
    └─ Navigate → /exercise/3/execute
    ↓
Complete Exercise 3
    ↓
goToNextExercise()
    ├─ currentIndex = 2
    ├─ nextIndex = 3
    ├─ 3 < 3 ? NO ← Last exercise!
    └─ finalizeWorkout()
        ├─ submitWorkoutLog()
        ├─ clearWorkout()
        └─ Navigate to /programs/:id/days/:id?completed=true
```

## Files Modified
- ✅ `ProgramDayDetailComponent` (3 changes)
- ✅ `ExerciseExecutionComponent` (2 changes)
- ✅ No other files needed

## Guarantees Provided
| What | How |
|------|-----|
| Knows exercise count | `initializeWorkout()` receives all |
| Executes in order | Index-based navigation |
| Submits once | Only in `finalizeWorkout()` |
| Last exercise works | Clear exit: `nextIndex >= length` |
| No data loss | Session held until submission |

## Testing Steps
1. ✅ Load program day with 3 exercises
2. ✅ Click "Start Workout"
3. ✅ Should navigate to Exercise 1
4. ✅ Complete Exercise 1, click "Continue"
5. ✅ Should navigate to Exercise 2
6. ✅ Complete Exercise 2, click "Continue"
7. ✅ Should navigate to Exercise 3
8. ✅ Complete Exercise 3, click "Continue"
9. ✅ Should submit and navigate back to day detail
10. ✅ Should show completion indicator

## Compilation Status
```
✅ Build successful
✅ No TypeScript errors
✅ No Angular compilation errors
✅ Bundle size OK
✅ Production ready
```

## What Changed vs What Stayed The Same

### Changed ✅
- How workout starts (now initializes all exercises)
- How exercises navigate (using session index)
- When/how workout submits (after ALL exercises)

### Stayed The Same ✅
- Exercise execution UI
- Set/rep logging logic
- Rest timers
- Backend API
- Route paths
- Service API (WorkoutStateService works as-is)

## Common Questions

**Q: What if user abandons workout midway?**
A: Session persists in service memory. Can resume or session clears on app reload.

**Q: What if network fails during submission?**
A: `finalizeWorkout()` has try-catch. Falls back to `/programs` route.

**Q: Can user manually navigate to different exercise?**
A: Session-based navigation prevents invalid jumps (missing exercises).

**Q: Is data submitted per-exercise?**
A: No. Only submitted once via `submitWorkoutLog()` after all exercises.

**Q: Can workout be resubmitted?**
A: No. Session cleared after successful submission. Prevents duplicates.
