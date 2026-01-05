# Client Programs API Integration Update

**Date**: January 3, 2026  
**Status**: ✅ Complete

## Overview

Updated the Gymunity Frontend Client project to align with the official **Client Programs API Documentation**. All models and service endpoints now correctly reflect the backend API specification.

---

## Changes Made

### 1. **Updated ProgramResponse Model**
**File**: [src/app/core/models/program.model.ts](src/app/core/models/program.model.ts)

**Changes**:
- Made `price` field optional (`price?: number | null`)
- Made `maxClients` field optional (`maxClients?: number | null`)
- Made `thumbnailUrl` field optional (`thumbnailUrl?: string`)
- Made `trainerProfileId` field optional (`trainerProfileId?: number`)
- Made `trainerUserName` field optional (`trainerUserName?: string`)
- Made `trainerHandle` field optional (`trainerHandle?: string`)
- Added JSDoc comments explaining:
  - `totalExercises` is a computed field
  - `price` can be null for subscription-only programs
  - `maxClients` can be null for unlimited clients
  - `createdAt` and `updatedAt` are ISO 8601 strings

**Rationale**: API returns these fields as optional/nullable. Frontend must handle null/undefined values gracefully.

---

### 2. **Updated ProgramDayResponse Model**
**File**: [src/app/core/models/program.model.ts](src/app/core/models/program.model.ts)

**Changes**:
- Made `title` field optional (`title?: string`)
- Made `notes` field optional (`notes?: string`)
- Added JSDoc comments explaining:
  - `dayNumber` represents 1-7 (day of week)
  - Title examples: "Upper Body A", "Rest", etc.

**Rationale**: Not all days have explicit titles or notes in the API response.

---

### 3. **Updated ProgramDayExerciseResponse Model**
**File**: [src/app/core/models/program.model.ts](src/app/core/models/program.model.ts)

**Changes**:
- Changed `sets` from `number` to `string` (e.g., "3", "3-4", "5x5")
- Changed `reps` from `number` to `string` (e.g., "8-12", "AMRAP")
- Changed `rpe` from `string` to `number` (0-10 scale)
- Changed `percent1RM` from `string` to `number`
- Made all non-required fields optional:
  - `sets?: string`
  - `reps?: string`
  - `restSeconds?: number`
  - `tempo?: string`
  - `rpe?: number`
  - `percent1RM?: number`
  - `notes?: string`
  - `videoUrl?: string`
  - `exerciseDataJson?: string`
  - `equipment?: string`
  - `videoDemoUrl?: string`
  - `thumbnailUrl?: string`
  - `trainerId?: string`
- Fixed field name: `excersiceName` (API has this typo)
- Added comprehensive JSDoc explaining:
  - Sets/Reps formats (simple vs. complex)
  - Tempo code structure: "3010" (eccentric-pause-concentric-pause)
  - RPE scale (0-10)
  - Percent1RM definition
  - ExerciseDataJson for complex workout specs (supersets, circuits, AMRAP)

**Rationale**: 
- API returns these as flexible string formats, not strict numbers
- Sets and reps can have complex representations (e.g., "AMRAP", "5x5", "3-4")
- Most fields are optional in the API response
- Frontend must handle null/undefined exercise data gracefully

---

### 4. **Fixed ClientProgramsService Endpoint**
**File**: [src/app/features/programs/services/client-programs.service.ts](src/app/features/programs/services/client-programs.service.ts)

**Changes**:
- Fixed `getActivePrograms()` endpoint from `/api/client/clientprograms` to `/api/client/programs`
- Updated JSDoc to reflect correct endpoint path

**Rationale**: The endpoint was incorrectly named; corrected to match API specification.

---

## API Endpoints Summary

All endpoints are in the `ClientProgramsService` and use the base URL `/api/client/programs`:

| Method | Endpoint | Service Method | Returns |
|--------|----------|-----------------|---------|
| GET | `/api/client/programs` | `getActivePrograms()` | `ProgramResponse[]` |
| GET | `/api/client/programs/{programId}` | `getProgramById()` | `ProgramResponse` |
| GET | `/api/client/programs/{programId}/weeks` | `getProgramWeeks()` | `ProgramWeekResponse[]` |
| GET | `/api/client/programs/{weekId}/days` | `getDaysByWeekId()` | `ProgramDayResponse[]` |
| GET | `/api/client/programs/days/{dayId}` | `getDayById()` | `ProgramDayResponse` |

---

## Authorization & Error Handling

✅ **All endpoints require authentication**
- Handled by existing `AuthInterceptor`
- User identity taken from JWT token
- Client sees only programs from active subscriptions

✅ **Error Responses**
- `401 Unauthorized`: User not authenticated or not authorized to access program
- `400 Bad Request`: Program/week/day not found or server error

---

## Key Features Aligned with Backend

1. **Subscription-Based Access Control**
   - Clients can only access programs from active subscriptions
   - Authorization checked on every request

2. **Computed Fields**
   - `durationWeeks`: Calculated from total weeks in program
   - `totalExercises`: Calculated from all exercises across all weeks

3. **ISO 8601 Date Format**
   - `createdAt` and `updatedAt` are ISO 8601 strings
   - Frontend can parse with `new Date(dateString)`

4. **Flexible Exercise Data**
   - Sets/reps support complex formats (e.g., "AMRAP", "5x5", "3-4")
   - RPE is numeric (0-10 scale)
   - Tempo uses 4-digit code (e.g., "3010")
   - Optional `exerciseDataJson` for supersets, circuits, and AMRAP specs

---

## Usage Examples

### Get User's Programs
```typescript
this.clientProgramsService.getActivePrograms().subscribe(programs => {
  programs.forEach(prog => {
    console.log(prog.title, `- ${prog.durationWeeks} weeks, ${prog.totalExercises} exercises`);
  });
});
```

### Get Program Details
```typescript
this.clientProgramsService.getProgramById(1).subscribe(program => {
  console.log(program.title);
  console.log(`Trainer: ${program.trainerHandle}`);
});
```

### Get Weeks in Program
```typescript
this.clientProgramsService.getProgramWeeks(1).subscribe(weeks => {
  weeks.forEach(week => {
    console.log(`Week ${week.weekNumber}`);
  });
});
```

### Get Days in Week
```typescript
this.clientProgramsService.getDaysByWeekId(10).subscribe(days => {
  days.forEach(day => {
    console.log(`${day.title || 'Unnamed'} - ${day.exercises.length} exercises`);
  });
});
```

### Get Detailed Day with Exercises
```typescript
this.clientProgramsService.getDayById(50).subscribe(day => {
  day.exercises.forEach(ex => {
    console.log(`${ex.excersiceName}: ${ex.sets} sets x ${ex.reps} reps @ RPE ${ex.rpe}`);
  });
});
```

---

## Testing Checklist

- [ ] Verify `getActivePrograms()` calls correct endpoint
- [ ] Verify optional fields handle null/undefined gracefully
- [ ] Test with programs that have minimal metadata
- [ ] Test with programs with full metadata
- [ ] Verify exercise sets/reps render correctly with complex formats
- [ ] Test authorization: verify 401 response when accessing unauthorized program
- [ ] Test error handling: verify 400 response when program not found

---

## Next Steps

1. **Component Updates** (if needed):
   - Update components that display programs to handle optional fields
   - Add null-checks for trainer info, thumbnails, etc.

2. **Display Formatting**:
   - Format sets/reps correctly (they're now strings, not numbers)
   - Parse and display complex workout specs from `exerciseDataJson`

3. **Performance**:
   - Consider caching active programs
   - Implement lazy-loading for exercise details

4. **UI/UX**:
   - Show "No title" or "Rest day" when day title is missing
   - Display trainer profile link when `trainerHandle` is available
   - Show exercise demo videos from `videoDemoUrl`

---

## Files Modified

- `src/app/core/models/program.model.ts` - Updated all DTOs
- `src/app/features/programs/services/client-programs.service.ts` - Fixed endpoint

---

## References

- **Backend Documentation**: Client-Programs API (ITI.Gymunity.FP backend)
- **API Controller**: `ClientProgramsController` in `/api/client/programs`
- **Service Architecture**: Subscription-based authorization model
