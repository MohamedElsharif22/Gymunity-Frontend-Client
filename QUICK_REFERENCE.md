# 🚀 Quick Reference Guide

## Service Location & Import Guide

### Core Services
```typescript
import { AuthService } from './core/services';
import { NotificationService } from './core/services';
import { ApiService } from './core/services';
```

### Feature Services
```typescript
// Profile & Onboarding
import { ClientProfileService } from './features/profile/services';

// Programs & Classes
import { ProgramService } from './features/classes/services';

// Workouts & Progress
import { WorkoutLogService } from './features/dashboard/services';

// Memberships & Subscriptions
import { SubscriptionService } from './features/memberships/services';
import { PaymentService } from './features/memberships/services';

// Trainers & Discovery
import { HomeClientService } from './features/trainers/services';
import { ReviewService } from './features/trainers/services';
import { ChatService } from './features/trainers/services';
```

---

## Common Usage Patterns

### 1. **Authentication Flow**
```typescript
// Login
private authService = inject(AuthService);

login(email: string, password: string) {
  this.authService.login({ email, password })
    .pipe(tap(response => {
      // Automatically updates signals
    }))
    .subscribe();
}

// Check authentication status
isAuthenticated = computed(() => this.authService.isAuthenticated());
currentUser = computed(() => this.authService.currentUser());
```

### 2. **Data Loading with Loading State**
```typescript
private programService = inject(ProgramService);

programs = signal<Program[]>([]);
isLoading = signal(false);

loadPrograms() {
  this.isLoading.set(true);
  this.programService.getAllActivePrograms()
    .pipe(
      tap(programs => {
        this.programs.set(programs);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        throw error;
      })
    )
    .subscribe();
}
```

### 3. **Pagination**
```typescript
private workoutService = inject(WorkoutLogService);

currentPage = signal(1);
pageSize = signal(10);

getWorkoutLogs() {
  this.workoutService.getWorkoutLogs(
    this.currentPage(),
    this.pageSize()
  ).subscribe(response => {
    // response: PaginatedResponse<WorkoutLog>
  });
}
```

### 4. **Handling API Errors**
```typescript
import { catchError } from 'rxjs';

callAPI() {
  this.service.getData()
    .pipe(
      catchError(error => {
        console.error('API Error:', error);
        // Handle error appropriately
        throw error;
      })
    )
    .subscribe();
}
```

---

## Model Examples

### Creating User Objects
```typescript
import { User, UserRole } from './core/models';

const user: User = {
  id: '123',
  name: 'John Doe',
  userName: 'john_doe',
  email: 'john@example.com',
  role: UserRole.Client,
  profilePhotoUrl: 'https://...'
};
```

### Making Profile Requests
```typescript
import { CreateClientProfileRequest } from './core/models';

const profileRequest: CreateClientProfileRequest = {
  userName: 'john_doe',
  heightCm: 180,
  startingWeightKg: 80,
  gender: 'Male',
  goal: 'Muscle Gain',
  experienceLevel: 'Intermediate'
};

this.profileService.createProfile(profileRequest).subscribe();
```

### Workout Logging
```typescript
import { CreateWorkoutLogRequest } from './core/models';

const workoutLog: CreateWorkoutLogRequest = {
  programDayId: 1,
  completedAt: new Date(),
  durationMinutes: 60,
  notes: 'Great workout!',
  exercisesLoggedJson: JSON.stringify([
    { exerciseId: 1, sets: 4, reps: [10, 10, 8, 8], weight: 100 }
  ])
};

this.workoutService.createWorkoutLog(workoutLog).subscribe();
```

### Payment Processing
```typescript
import { InitiatePaymentRequest, PaymentMethod } from './core/models';

const paymentRequest: InitiatePaymentRequest = {
  subscriptionId: 1,
  paymentMethod: PaymentMethod.CreditCard,
  returnUrl: 'https://app.gymunity.com/payment-success'
};

this.paymentService.initiatePayment(paymentRequest).subscribe(response => {
  // Redirect to payment.paymentUrl
});
```

---

## Enum Reference

### User Roles
```typescript
UserRole.Client = 1
UserRole.Trainer = 2
```

### Program Types
```typescript
ProgramType.Strength = 1
ProgramType.Hypertrophy = 2
ProgramType.Endurance = 3
ProgramType.FatLoss = 4
ProgramType.General = 5
```

### Subscription Status
```typescript
SubscriptionStatus.Active = 'Active'
SubscriptionStatus.Expired = 'Expired'
SubscriptionStatus.Cancelled = 'Cancelled'
SubscriptionStatus.Paused = 'Paused'
```

### Payment Status
```typescript
PaymentStatus.Pending = 'Pending'
PaymentStatus.Processing = 'Processing'
PaymentStatus.Completed = 'Completed'
PaymentStatus.Failed = 'Failed'
PaymentStatus.Refunded = 'Refunded'
```

### Payment Methods
```typescript
PaymentMethod.CreditCard = 1
PaymentMethod.Wallet = 2
PaymentMethod.MobilePayment = 3
PaymentMethod.BankTransfer = 4
```

### Message Types
```typescript
MessageType.Text = 1
MessageType.Image = 2
MessageType.File = 3
MessageType.Video = 4
```

### Notification Types
```typescript
NotificationType.Message = 1
NotificationType.Subscription = 2
NotificationType.Payment = 3
NotificationType.Booking = 4
NotificationType.System = 5
NotificationType.Review = 6
NotificationType.Program = 7
```

---

## API Endpoint Quick List

| Service | Method | Endpoint |
|---------|--------|----------|
| **AuthService** | login | POST `/api/account/login` |
| | register | POST `/api/account/register` |
| | googleAuth | POST `/api/account/google-auth` |
| **ClientProfileService** | getMyProfile | GET `/api/client/clientprofile` |
| | getDashboard | GET `/api/client/clientprofile/dashboard` |
| | createProfile | POST `/api/client/clientprofile` |
| | updateProfile | PUT `/api/client/clientprofile` |
| **ProgramService** | getAllActivePrograms | GET `/api/client/clientprograms` |
| | getAllPrograms | GET `/api/homeclient/programs` |
| **WorkoutLogService** | createWorkoutLog | POST `/api/client/workoutlog` |
| | getWorkoutLogs | GET `/api/client/workoutlog` |
| **SubscriptionService** | getAllPackages | GET `/api/homeclient/packages` |
| | subscribe | POST `/api/client/subscriptions/subscribe` |
| | getMySubscriptions | GET `/api/client/subscriptions` |
| **PaymentService** | initiatePayment | POST `/api/client/payments/initiate` |
| | getPayments | GET `/api/client/payments` |
| **ChatService** | getAllThreads | GET `/api/client/chat/threads` |
| | sendMessage | POST `/api/client/chat/threads/{id}/messages` |
| **NotificationService** | getAllNotifications | GET `/api/client/notifications` |
| | getUnreadCount | GET `/api/client/notifications/unread-count` |
| | markAsRead | PUT `/api/client/notifications/{id}/read` |
| **ReviewService** | createTrainerReview | POST `/api/client/reviews/trainer/{id}` |

---

## Testing Services

### Unit Test Template
```typescript
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';
import { ApiService } from '../../../core/services';

describe('MyService', () => {
  let service: MyService;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MyService,
        {
          provide: ApiService,
          useValue: jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete'])
        }
      ]
    });

    service = TestBed.inject(MyService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should fetch data', (done) => {
    const mockData = { id: 1, name: 'Test' };
    apiService.get.and.returnValue(of(mockData));

    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
      done();
    });
  });
});
```

---

## Component Integration Example

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { ClientProfileService } from './services';
import { ClientProfile } from '../../core/models';

@Component({
  selector: 'app-profile',
  template: `
    <div *ngIf="isLoading()">Loading...</div>
    <div *ngIf="profile() as profile">
      <h1>{{ profile.userName }}</h1>
      <p>Goal: {{ profile.goal }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private profileService = inject(ClientProfileService);

  profile = signal<ClientProfile | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadProfile();
  }

  private loadProfile() {
    this.isLoading.set(true);
    this.profileService.getMyProfile()
      .pipe(
        tap(profile => {
          this.profile.set(profile);
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.error.set(error.message);
          this.isLoading.set(false);
          throw error;
        })
      )
      .subscribe();
  }
}
```

---

## Troubleshooting

### "Service not found" errors
✅ Ensure service is provided with `providedIn: 'root'`  
✅ Check import path matches actual file location

### "Type 'unknown'" errors
✅ Use explicit type parameters: `get<ModelType>()`  
✅ Check model is exported from index.ts

### "Signal is not reactive"
✅ Use `computed()` for derived state  
✅ Properly update signals with `.set()` or `.update()`

### API returns different structure
✅ Update model interfaces  
✅ Check Postman collection for latest spec  
✅ Run `ng serve --strict` to catch type issues

---

## Performance Tips

1. **Use OnPush Change Detection**
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   ```

2. **Unsubscribe from Observables**
   ```typescript
   private destroy$ = new Subject<void>();

   ngOnInit() {
     this.service.getData()
       .pipe(takeUntil(this.destroy$))
       .subscribe();
   }

   ngOnDestroy() {
     this.destroy$.next();
   }
   ```

3. **Use Signals for Local State**
   - Signals are more efficient than RxJS
   - Don't need unsubscribe logic

---

**Last Updated**: December 31, 2025  
**Version**: 1.0.0
