# Client Programs Feature - Implementation Guide

## Overview
This document describes the complete implementation of the Client Programs feature, integrating with the `ClientProgramsController` API backend.

**Source of Truth:** Backend documentation from `ClientProgramsController.md`

---

## Architecture

### File Structure
```
src/app/features/programs/
├── components/
│   ├── programs-list/
│   │   └── programs-list.component.ts
│   ├── program-details/
│   │   └── program-details.component.ts
│   ├── program-weeks/
│   │   └── program-weeks.component.ts
│   ├── program-days/
│   │   └── program-days.component.ts
│   └── day-details/
│       └── day-details.component.ts
├── services/
│   └── client-programs.service.ts
└── README.md (this file)

src/app/core/models/
└── program.model.ts (contains new ClientPrograms DTOs)
```

---

## Models / DTOs

All DTOs are defined in `src/app/core/models/program.model.ts` and exported via `src/app/core/models/index.ts`.

### ProgramResponse
Represents a program available to the authenticated user.

```typescript
interface ProgramResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  durationWeeks: number;
  totalExercises: number;
  price: number;
  isPublic: boolean;
  maxClients: number;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
  trainerProfileId: number;
  trainerUserName: string;
  trainerHandle: string;
}
```

**Backend Endpoints:**
- `GET /api/client/programs/` → returns `IEnumerable<ProgramResponse>`
- `GET /api/client/programs/{programId}` → returns `ProgramResponse`

**Usage:**
- `ProgramsListComponent` — displays array of programs
- `ProgramDetailsComponent` — displays single program

---

### ProgramWeekResponse
Represents a week within a program.

```typescript
interface ProgramWeekResponse {
  id: number;
  programId: number;
  weekNumber: number;
}
```

**Backend Endpoint:**
- `GET /api/client/programs/{programId}/weeks` → returns `IEnumerable<ProgramWeekResponse>`

**Usage:**
- `ProgramWeeksComponent` — displays weeks for a program

---

### ProgramDayResponse
Represents a day within a program week, includes nested exercises.

```typescript
interface ProgramDayResponse {
  id: number;
  programWeekId: number;
  dayNumber: number;
  title: string;
  notes: string;
  exercises: ProgramDayExerciseResponse[];
}
```

**Backend Endpoints:**
- `GET /api/client/programs/{weekId}/days` → returns `IEnumerable<ProgramDayResponse>`
- `GET /api/client/programs/days/{dayId}` → returns `ProgramDayResponse`

**Usage:**
- `ProgramDaysComponent` — displays days for a week
- `DayDetailsComponent` — displays single day with exercises

---

### ProgramDayExerciseResponse
Represents an exercise within a program day.

```typescript
interface ProgramDayExerciseResponse {
  programDayId: number;
  exerciseId: number;
  orderIndex: number;
  sets: number;
  reps: number;
  restSeconds: number;
  tempo: string;
  rpe: string;
  percent1RM: string;
  notes: string;
  videoUrl: string;
  exerciseDataJson: string;
  exerciseName: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  videoDemoUrl: string;
  thumbnailUrl: string;
  isCustom: boolean;
  trainerId: number;
}
```

**Usage:**
- Nested within `ProgramDayResponse.exercises`
- Displayed in `DayDetailsComponent`

---

## Service: ClientProgramsService

**File:** `src/app/features/programs/services/client-programs.service.ts`

**Pattern:** Singleton service, follows existing project patterns
- Injected with `inject()` function
- Provided in `'root'`
- Uses `ApiService` for HTTP calls
- Returns strongly-typed `Observable<T>`
- Uses correct endpoints and HTTP methods from backend documentation

### Methods

#### getActivePrograms(): Observable<ProgramResponse[]>
Retrieves all active programs for the authenticated user.

**Backend:** `GET /api/client/programs/`

**Usage:**
```typescript
this.programsService.getActivePrograms().subscribe(programs => {
  // programs: ProgramResponse[]
});
```

---

#### getProgramById(programId: string | number): Observable<ProgramResponse>
Retrieves a specific program by ID.

**Backend:** `GET /api/client/programs/{programId}`

**Usage:**
```typescript
this.programsService.getProgramById(123).subscribe(program => {
  // program: ProgramResponse
});
```

---

#### getProgramWeeks(programId: string | number): Observable<ProgramWeekResponse[]>
Retrieves all weeks for a specific program.

**Backend:** `GET /api/client/programs/{programId}/weeks`

**Usage:**
```typescript
this.programsService.getProgramWeeks(123).subscribe(weeks => {
  // weeks: ProgramWeekResponse[]
});
```

---

#### getDaysByWeekId(weekId: string | number): Observable<ProgramDayResponse[]>
Retrieves all days for a specific week.

**⚠️ IMPORTANT:** The route parameter is `weekId`, not `programId`. The week ID uniquely identifies a week across all programs.

**Backend:** `GET /api/client/programs/{weekId}/days`

**Usage:**
```typescript
this.programsService.getDaysByWeekId(45).subscribe(days => {
  // days: ProgramDayResponse[]
});
```

---

#### getDayById(dayId: string | number): Observable<ProgramDayResponse>
Retrieves a specific program day with all its exercises.

**Backend:** `GET /api/client/programs/days/{dayId}`

**Usage:**
```typescript
this.programsService.getDayById(987).subscribe(day => {
  // day: ProgramDayResponse (includes day.exercises)
});
```

---

## Components

### 1. ProgramsListComponent

**File:** `src/app/features/programs/components/programs-list/programs-list.component.ts`

**Responsibility:**
- Display all active programs available to user
- Navigate to program details on selection
- Show loading and error states

**Service Methods Used:**
- `ClientProgramsService.getActivePrograms()`

**Route:** `/programs`

**Signals:**
- `programs: Signal<ProgramResponse[]>` — array of programs
- `loading: Signal<boolean>` — loading state
- `error: Signal<string | null>` — error message

**Navigation:**
- Click on program card → `/programs/{programId}`

---

### 2. ProgramDetailsComponent

**File:** `src/app/features/programs/components/program-details/program-details.component.ts`

**Responsibility:**
- Display detailed information for a single program
- Show program metadata (trainer, duration, exercises, price)
- Navigate to program weeks

**Service Methods Used:**
- `ClientProgramsService.getProgramById(programId)`

**Route Parameters:**
- `programId` — required (from route)

**Route:** `/programs/:programId`

**Signals:**
- `program: Signal<ProgramResponse | null>` — program details
- `loading: Signal<boolean>` — loading state
- `error: Signal<string | null>` — error message

**Navigation:**
- "View Program Weeks" button → `/programs/{programId}/weeks`
- Back button → `/programs`

---

### 3. ProgramWeeksComponent

**File:** `src/app/features/programs/components/program-weeks/program-weeks.component.ts`

**Responsibility:**
- Display all weeks in a program
- Show week progression (Week 1, Week 2, etc.)
- Navigate to individual week's days

**Service Methods Used:**
- `ClientProgramsService.getProgramWeeks(programId)`

**Route Parameters:**
- `programId` — required (from parent route)

**Route:** `/programs/:programId/weeks`

**Signals:**
- `weeks: Signal<ProgramWeekResponse[]>` — array of weeks
- `loading: Signal<boolean>` — loading state
- `error: Signal<string | null>` — error message

**Navigation:**
- Click on week card → `/programs/weeks/{weekId}/days`
- Back button → `/programs`

---

### 4. ProgramDaysComponent

**File:** `src/app/features/programs/components/program-days/program-days.component.ts`

**Responsibility:**
- Display all days in a specific week
- Show day sequence (Day 1, Day 2, etc.)
- Show number of exercises per day
- Navigate to individual day details

**Service Methods Used:**
- `ClientProgramsService.getDaysByWeekId(weekId)`

**Route Parameters:**
- `weekId` — required (from parent route)

**Route:** `/programs/weeks/:weekId/days`

**Signals:**
- `days: Signal<ProgramDayResponse[]>` — array of days
- `loading: Signal<boolean>` — loading state
- `error: Signal<string | null>` — error message

**Navigation:**
- Click on day card → `/programs/days/{dayId}`
- Back button → `/programs`

---

### 5. DayDetailsComponent

**File:** `src/app/features/programs/components/day-details/day-details.component.ts`

**Responsibility:**
- Display detailed information for a single day
- Show all exercises with specifications (sets, reps, rest, tempo)
- Display video links and muscle group information
- Show exercise notes and additional parameters (RPE, %1RM)

**Service Methods Used:**
- `ClientProgramsService.getDayById(dayId)`

**Route Parameters:**
- `dayId` — required (from route)

**Route:** `/programs/days/:dayId`

**Signals:**
- `day: Signal<ProgramDayResponse | null>` — day details with exercises
- `loading: Signal<boolean>` — loading state
- `error: Signal<string | null>` — error message

**Navigation:**
- Back button → `/programs`

---

## Routing Configuration

All programs routes are nested under the authenticated (`authGuard`) area.

**File:** `src/app/app.routes.ts`

```typescript
{
  path: 'programs',
  canActivate: [authGuard],
  children: [
    {
      path: '',
      loadComponent: () => import('./features/programs/components/programs-list/programs-list.component').then(m => m.ProgramsListComponent)
    },
    {
      path: ':programId',
      loadComponent: () => import('./features/programs/components/program-details/program-details.component').then(m => m.ProgramDetailsComponent)
    },
    {
      path: ':programId/weeks',
      loadComponent: () => import('./features/programs/components/program-weeks/program-weeks.component').then(m => m.ProgramWeeksComponent)
    },
    {
      path: 'weeks/:weekId/days',
      loadComponent: () => import('./features/programs/components/program-days/program-days.component').then(m => m.ProgramDaysComponent)
    },
    {
      path: 'days/:dayId',
      loadComponent: () => import('./features/programs/components/day-details/day-details.component').then(m => m.DayDetailsComponent)
    }
  ]
}
```

### Route Hierarchy

```
/programs                          → ProgramsListComponent
/programs/:programId               → ProgramDetailsComponent
/programs/:programId/weeks         → ProgramWeeksComponent
/programs/weeks/:weekId/days       → ProgramDaysComponent
/programs/days/:dayId              → DayDetailsComponent
```

---

## Authentication & Authorization

- All routes are protected by `authGuard` — user must be authenticated
- Token is automatically attached to all API requests via `AuthInterceptor`
- Backend responds with `401 Unauthorized` if user is not authenticated or not authorized to access program
- Backend responds with `400 Bad Request` for server errors (handled in components)

---

## Error Handling

Each component implements consistent error handling:

1. **Loading State:** Shows spinner while data is being fetched
2. **Error State:** Displays error message from backend (if available) or default message
3. **Empty State:** Shows appropriate message when no data is available
4. **Logging:** All requests/errors are logged to console (can be removed in production)

**Common Error Scenarios:**

| Status | Cause | Component Action |
|--------|-------|-----------------|
| 401 | Not authenticated | Interceptor redirects to `/auth/login` |
| 404 | Program/week/day not found | Shows error message, allows back navigation |
| 400 | Bad request / server error | Shows error message from backend |
| Network error | Backend unreachable | Shows "Failed to load" message |

---

## Integration Notes

### Dependency Injection
All services and components use Angular's `inject()` function (modern pattern):

```typescript
private programsService = inject(ClientProgramsService);
private route = inject(ActivatedRoute);
private router = inject(Router);
```

### Signals
All state is managed using Angular signals (modern pattern):

```typescript
programs = signal<ProgramResponse[]>([]);
loading = signal(false);
error = signal<string | null>(null);
```

### RxJS
- Unsubscription handled via `takeUntil(destroy$)` pattern
- Components implement `OnDestroy` to clean up subscriptions
- No memory leaks

### Standalone Components
All components are standalone (no NgModule required):

```typescript
@Component({
  selector: 'app-programs-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  // ...
})
```

---

## Testing Recommendations

### Unit Tests
- Test service methods return correct Observable types
- Mock `ApiService` responses

### Integration Tests
- Test navigation between components
- Test route parameter passing
- Test error state display

### E2E Tests
- Test complete user flow: list → details → weeks → days → day details
- Test back navigation
- Test error scenarios

---

## Backend Assumptions

The following assumptions are made about the backend `ClientProgramsController`:

1. **Authentication:** All endpoints require `Authorization: Bearer {token}` header
2. **Route parameters:** Are validated and converted to correct types by backend
3. **Error format:** Errors return `{ message: string, errors?: string[] }`
4. **Status codes:**
   - `200 OK` — Success
   - `400 Bad Request` — Invalid request or server error
   - `401 Unauthorized` — Not authenticated or not authorized
5. **No pagination:** Lists return all items (if pagination needed, update service)
6. **Timestamps:** `createdAt` and `updatedAt` are ISO 8601 strings
7. **URLs:** `thumbnailUrl`, `videoUrl`, `videoDemoUrl` are absolute or relative URLs

---

## Future Enhancements

1. **Pagination:** Add pagination support to list endpoints
2. **Caching:** Cache program data using `shareReplay()` RxJS operator
3. **Refresh token:** Implement refresh token flow if backend supports
4. **Offline support:** Cache programs using local storage
5. **Analytics:** Track which programs/weeks/days users view
6. **Favorites:** Add "favorite" functionality per program
7. **Search:** Add search/filter capability to programs list
8. **Notifications:** Real-time updates when program changes

---

## Debugging

### Enable Additional Logging

Each service method includes `console.log()` statements. Check browser console for:

```
[ClientProgramsService] GET request: https://api.example.com/api/client/programs
[ProgramsListComponent] Programs loaded: [...]
[ProgramDetailsComponent] Error loading program: {...}
```

### Check Network Requests

Use browser DevTools → Network tab:

1. Filter by "XHR" / "Fetch"
2. Look for requests to `/api/client/programs*`
3. Check response status (200, 400, 401)
4. Verify `Authorization` header is present

### Test Service Directly

In browser console:

```typescript
const service = ng.probe(document.body).injector.get(ClientProgramsService);
service.getActivePrograms().subscribe(console.log);
```

---

## Files Modified / Created

### Created
- `src/app/features/programs/services/client-programs.service.ts`
- `src/app/features/programs/components/programs-list/programs-list.component.ts`
- `src/app/features/programs/components/program-details/program-details.component.ts`
- `src/app/features/programs/components/program-weeks/program-weeks.component.ts`
- `src/app/features/programs/components/program-days/program-days.component.ts`
- `src/app/features/programs/components/day-details/day-details.component.ts`

### Modified
- `src/app/core/models/program.model.ts` — Added ClientPrograms DTOs
- `src/app/app.routes.ts` — Added programs routes

---

## Quick Start

1. **Navigate to Programs List:**
   ```
   localhost:4200/programs
   ```

2. **View Program Details:**
   ```
   localhost:4200/programs/123
   ```

3. **View Week Days:**
   ```
   localhost:4200/programs/123/weeks
   localhost:4200/programs/weeks/45/days
   ```

4. **View Day Exercises:**
   ```
   localhost:4200/programs/days/987
   ```

---

**Last Updated:** January 2, 2026  
**Status:** Ready for Production
