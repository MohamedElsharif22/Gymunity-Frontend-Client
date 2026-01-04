# HomeClient API Integration Guide

## Overview

The HomeClient API provides **public, unauthenticated access** to packages, programs, trainers, and unified search functionality. This document describes the implementation, services, models, and usage patterns.

**Base URL**: `/api/homeclient`

## Table of Contents

1. [Models & DTOs](#models--dtos)
2. [Service Implementation](#service-implementation)
3. [API Endpoints](#api-endpoints)
4. [Component Integration](#component-integration)
5. [Usage Examples](#usage-examples)
6. [Type Safety Notes](#type-safety-notes)

---

## Models & DTOs

### Location
`src/app/core/models/home-client.model.ts`

### Core Interfaces

#### TrainerClient
Lightweight trainer information from public endpoints.

```typescript
interface TrainerClient {
  id: number;                    // Trainer ID
  userId: string;                // User ID
  userName: string;              // Display name
  handle: string;                // Unique trainer handle
  bio: string;                   // Trainer biography
  coverImageUrl?: string | null; // Cover image
  ratingAverage: number;         // Average rating (0-5)
  totalClients: number;          // Number of total clients
}
```

**Note**: HomeClient API returns simplified trainer data. For full trainer profile details (specializations, experience, pricing, etc.), use `TrainerProfileService` with authenticated endpoints.

#### PackageClient
Package/subscription offering from trainer.

```typescript
interface PackageClient {
  id: number;                           // Package ID
  name: string;                         // Package name
  description: string;                  // Detailed description
  priceMonthly: number;                 // Monthly price
  priceYearly?: number | null;          // Optional yearly price
  isActive: boolean;                    // Active status
  thumbnailUrl?: string | null;         // Package image
  trainerId: string;                    // Trainer user ID
  createdAt: string;                    // ISO datetime
  isAnnual: boolean;                    // Is annual billing
  promoCode?: string | null;            // Associated promo code
  programs?: ProgramBrief[];            // Included programs (brief)
}
```

#### ProgramBrief
Minimal program information (used within PackageClient).

```typescript
interface ProgramBrief {
  title: string;
  description?: string;
  durationWeeks?: number;
  thumbnailUrl?: string;
}
```

#### ProgramClient
Full program information.

```typescript
interface ProgramClient {
  id: number;                     // Program ID
  title: string;                  // Program title
  description: string;            // Detailed description
  type: string | number;          // ProgramType enum
  durationWeeks: number;          // Duration in weeks
  price?: number | null;          // Optional price
  isPublic: boolean;              // Public visibility
  maxClients?: number | null;     // Max participant limit
  thumbnailUrl?: string | null;   // Program image
  createdAt: string;              // ISO datetime
  updatedAt: string;              // Last update datetime
  trainerId: string;              // Trainer user ID
  trainerProfileId?: number | null;   // Trainer profile ID
  trainerUserName?: string | null;    // Trainer name
  trainerHandle?: string | null;      // Trainer handle
}
```

#### HomeClientSearchResponse
Unified search results.

```typescript
interface HomeClientSearchResponse {
  packages: PackageClient[];
  programs: ProgramClient[];
  trainers: TrainerClient[];
}
```

---

## Service Implementation

### Location
`src/app/features/trainers/services/home-client.service.ts`

### Service Structure

The `HomeClientService` provides type-safe wrappers around HomeClient API endpoints with organized method groups:

```typescript
@Injectable({ providedIn: 'root' })
export class HomeClientService {
  // Organized by endpoint groups:
  // - Search
  // - Packages
  // - Trainers
  // - Programs
}
```

### Service Injection

```typescript
// In any component
private homeClientService = inject(HomeClientService);
```

---

## API Endpoints

All endpoints are **public** and require **no authentication**.

### Search Endpoints

#### Global Search
**Method**: GET  
**Endpoint**: `/api/homeclient/search?term={term}`  
**Returns**: `HomeClientSearchResponse`

Searches across packages, programs, and trainers with a single term.

```typescript
this.homeClientService.search('yoga').subscribe(results => {
  const trainers = results.trainers;     // TrainerClient[]
  const packages = results.packages;     // PackageClient[]
  const programs = results.programs;     // ProgramClient[]
});
```

### Package Endpoints

#### Get All Packages
**Method**: GET  
**Endpoint**: `/api/homeclient/packages`  
**Returns**: `PackageClient[]`

```typescript
this.homeClientService.getAllPackages().subscribe(packages => {
  // packages: PackageClient[]
});
```

#### Get Package by ID
**Method**: GET  
**Endpoint**: `/api/homeclient/packages/{id}`  
**Returns**: `PackageClient`

```typescript
this.homeClientService.getPackageById('123').subscribe(pkg => {
  // pkg: PackageClient
});
```

#### Get Packages by Trainer Profile ID
**Method**: GET  
**Endpoint**: `/api/homeclient/trainers/{trainerProfileId}/packages`  
**Returns**: `PackageClient[]`

```typescript
this.homeClientService.getPackagesByTrainerProfileId('456').subscribe(packages => {
  // packages: PackageClient[]
});
```

#### Get Packages by Trainer User ID
**Method**: GET  
**Endpoint**: `/api/homeclient/packages/byTrainerUser/{trainerUserId}`  
**Returns**: `PackageClient[]`

```typescript
this.homeClientService.getPackagesByTrainerUserId('user-123').subscribe(packages => {
  // packages: PackageClient[]
});
```

#### Get Packages by Trainer Profile (Alternative)
**Method**: GET  
**Endpoint**: `/api/homeclient/packages/byTrainer/{trainerProfileId}`  
**Returns**: `PackageClient[]`

```typescript
this.homeClientService.getPackagesByTrainerProfile('456').subscribe(packages => {
  // packages: PackageClient[]
});
```

### Trainer Endpoints

#### Get All Trainers
**Method**: GET  
**Endpoint**: `/api/homeclient/trainers`  
**Returns**: `TrainerClient[]`

```typescript
this.homeClientService.getAllTrainers().subscribe(trainers => {
  // trainers: TrainerClient[]
});
```

#### Get Trainer by ID
**Method**: GET  
**Endpoint**: `/api/homeclient/trainers/{id}`  
**Returns**: `TrainerClient`

```typescript
this.homeClientService.getTrainerById('123').subscribe(trainer => {
  // trainer: TrainerClient
});
```

#### Get Trainer's Packages
**Method**: GET  
**Endpoint**: `/api/homeclient/trainers/{trainerProfileId}/packages`  
**Returns**: `PackageClient[]`

```typescript
this.homeClientService.getTrainerPackages('456').subscribe(packages => {
  // packages: PackageClient[]
});
```

### Program Endpoints

#### Get All Programs
**Method**: GET  
**Endpoint**: `/api/homeclient/programs`  
**Returns**: `ProgramClient[]`

```typescript
this.homeClientService.getAllPrograms().subscribe(programs => {
  // programs: ProgramClient[]
});
```

#### Get Program by ID
**Method**: GET  
**Endpoint**: `/api/homeclient/programs/{id}`  
**Returns**: `ProgramClient`

```typescript
this.homeClientService.getProgramById('789').subscribe(program => {
  // program: ProgramClient
});
```

#### Get Programs by Trainer Profile
**Method**: GET  
**Endpoint**: `/api/homeclient/programs/byTrainerProfile/{trainerProfileId}`  
**Returns**: `ProgramClient[]`

```typescript
this.homeClientService.getProgramsByTrainerProfile('456').subscribe(programs => {
  // programs: ProgramClient[]
});
```

#### Get Programs by Trainer User ID
**Method**: GET  
**Endpoint**: `/api/homeclient/programs/byTrainer/{trainerId}`  
**Returns**: `ProgramClient[]`

```typescript
this.homeClientService.getProgramsByTrainerId('user-123').subscribe(programs => {
  // programs: ProgramClient[]
});
```

---

## Component Integration

### TrainersComponent

**Location**: `src/app/features/trainers/components/trainers.component.ts`

The TrainersComponent has been updated to support **dual data sources**:

1. **TrainerDiscoveryService** (authenticated, detailed)
2. **HomeClientService** (public, simplified)

#### State Management

```typescript
private homeClientService = inject(HomeClientService);

// Toggle between data sources
useHomeClientSearch = signal(false);

// Load data from appropriate source
loadTrainers(): void {
  if (this.useHomeClientSearch() && this.searchTerm()) {
    // Use HomeClient search
    this.homeClientService.search(this.searchTerm()).subscribe(/* ... */);
  } else if (this.useHomeClientSearch()) {
    // Use HomeClient get all
    this.homeClientService.getAllTrainers().subscribe(/* ... */);
  } else {
    // Use TrainerDiscoveryService (default)
    this.trainerDiscoveryService.searchTrainers().subscribe(/* ... */);
  }
}
```

#### Data Conversion

HomeClient returns simplified `TrainerClient` objects that need conversion to `TrainerCard` format:

```typescript
private convertToTrainerCard(client: TrainerClient): TrainerCard {
  return {
    id: String(client.id),
    fullName: client.userName,
    handle: client.handle,
    profilePhotoUrl: null,                    // Not in HomeClient API
    coverImageUrl: client.coverImageUrl || null,
    bio: client.bio,
    isVerified: false,                        // Not in HomeClient API
    ratingAverage: client.ratingAverage,
    totalReviews: 0,                          // Not in HomeClient API
    totalClients: client.totalClients,
    yearsExperience: 0,                       // Not in HomeClient API
    specializations: [],                      // Not in HomeClient API
    startingPrice: 0,                         // Not in HomeClient API
    currency: 'USD',
    hasActiveSubscription: false,             // Not in HomeClient API
  };
}
```

---

## Usage Examples

### Example 1: Search Packages and Programs

```typescript
constructor(private homeClientService = inject(HomeClientService)) {}

searchContent(term: string): void {
  this.homeClientService.search(term).subscribe({
    next: (results) => {
      console.log('Packages:', results.packages);
      console.log('Programs:', results.programs);
      console.log('Trainers:', results.trainers);
    },
    error: (err) => console.error('Search failed:', err),
  });
}
```

### Example 2: Display Trainer's Packages

```typescript
showTrainerPackages(trainerProfileId: string): void {
  this.homeClientService.getPackagesByTrainerProfile(trainerProfileId).subscribe({
    next: (packages) => {
      this.packages.set(packages);
    },
    error: (err) => console.error('Failed to load packages:', err),
  });
}
```

### Example 3: Browse All Programs

```typescript
loadPrograms(): void {
  this.homeClientService.getAllPrograms().subscribe({
    next: (programs) => {
      this.programs.set(programs);
    },
    error: (err) => console.error('Failed to load programs:', err),
  });
}
```

### Example 4: Get Trainer Details with Packages

```typescript
loadTrainerWithPackages(trainerProfileId: string): void {
  forkJoin({
    trainer: this.homeClientService.getTrainerById(trainerProfileId),
    packages: this.homeClientService.getPackagesByTrainerProfile(trainerProfileId),
  }).subscribe({
    next: ({ trainer, packages }) => {
      this.trainer.set(trainer);
      this.packages.set(packages);
    },
    error: (err) => console.error('Failed to load trainer details:', err),
  });
}
```

---

## Type Safety Notes

### Important Differences Between Services

| Aspect | TrainerDiscoveryService | HomeClientService |
|--------|-------------------------|-------------------|
| **Access** | Authenticated | Public |
| **Model** | TrainerCard (detailed) | TrainerClient (simplified) |
| **Fields** | All trainer details | Basic info + rating |
| **Use Case** | Admin/trainer features | Public discovery |

### Handling Missing Fields

When converting `TrainerClient` to `TrainerCard`, some fields aren't available:
- `profilePhotoUrl` → Set to `null`
- `specializations` → Set to `[]` (empty array)
- `yearsExperience` → Set to `0`
- `totalReviews` → Set to `0`
- `startingPrice` → Set to `0`
- `isVerified` → Set to `false`
- `currency` → Set to `'USD'` (default)
- `hasActiveSubscription` → Set to `false`

To get complete trainer information, use `TrainerProfileService` with the trainer's profile ID.

### Observable Patterns

Always use typed subscriptions:

```typescript
// ✅ GOOD - Type-safe
this.homeClientService.getTrainerById('123').subscribe({
  next: (trainer: TrainerClient) => {
    // trainer is typed as TrainerClient
  },
  error: (err: Error) => {
    // handle error
  },
});

// ❌ AVOID - Implicit any types
this.homeClientService.getTrainerById('123').subscribe({
  next: (trainer) => {
    // trainer type is any
  },
});
```

---

## Implementation Checklist

- ✅ `home-client.model.ts` - All DTOs created
- ✅ `home-client.service.ts` - All endpoints implemented
- ✅ `models/index.ts` - HomeClient models exported
- ✅ `trainers.component.ts` - Integrated with dual data source support
- ⏳ Package discovery component (could be created)
- ⏳ Program discovery component (could be created)
- ⏳ Home page search integration (could be integrated)

---

## Related Documentation

- **Trainer Features**: [TRAINER_FEATURE_QUICK_REFERENCE.md](./TRAINER_FEATURE_QUICK_REFERENCE.md)
- **Trainer Profile Implementation**: [TRAINER_PROFILE_IMPLEMENTATION.md](./TRAINER_PROFILE_IMPLEMENTATION.md)
- **Project Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## API Documentation Reference

For complete API specifications, see the backend HomeClient_API.md documentation.
