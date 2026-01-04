# HomeClient API - Quick Reference

## 📌 Quick Links

- **Models**: `src/app/core/models/home-client.model.ts`
- **Service**: `src/app/features/trainers/services/home-client.service.ts`
- **Component Usage**: `src/app/features/trainers/components/trainers.component.ts`

---

## 🔑 Key Models

### TrainerClient
```typescript
{ id, userId, userName, handle, bio, coverImageUrl, ratingAverage, totalClients }
```

### PackageClient
```typescript
{ id, name, description, priceMonthly, priceYearly, isActive, thumbnailUrl, trainerId, createdAt, isAnnual, promoCode, programs }
```

### ProgramClient
```typescript
{ id, title, description, type, durationWeeks, price, isPublic, maxClients, thumbnailUrl, createdAt, updatedAt, trainerId, trainerProfileId, trainerUserName, trainerHandle }
```

### HomeClientSearchResponse
```typescript
{ packages: PackageClient[], programs: ProgramClient[], trainers: TrainerClient[] }
```

---

## 🚀 Common Methods

### Search
```typescript
homeClientService.search(term: string) → HomeClientSearchResponse
```

### Trainers
```typescript
homeClientService.getAllTrainers() → TrainerClient[]
homeClientService.getTrainerById(id: string) → TrainerClient
homeClientService.getTrainerPackages(trainerProfileId: string) → PackageClient[]
```

### Packages
```typescript
homeClientService.getAllPackages() → PackageClient[]
homeClientService.getPackageById(id: string) → PackageClient
homeClientService.getPackagesByTrainerProfile(trainerProfileId: string) → PackageClient[]
homeClientService.getPackagesByTrainerUserId(trainerUserId: string) → PackageClient[]
homeClientService.getPackagesByTrainerProfileId(trainerProfileId: string) → PackageClient[]
```

### Programs
```typescript
homeClientService.getAllPrograms() → ProgramClient[]
homeClientService.getProgramById(id: string) → ProgramClient
homeClientService.getProgramsByTrainerProfile(trainerProfileId: string) → ProgramClient[]
homeClientService.getProgramsByTrainerId(trainerId: string) → ProgramClient[]
```

---

## 💡 Usage Pattern

```typescript
// In component
private homeClientService = inject(HomeClientService);

// Search across all content
this.homeClientService.search('yoga').subscribe(results => {
  this.trainers.set(results.trainers);
  this.packages.set(results.packages);
  this.programs.set(results.programs);
});

// Get specific trainer's content
forkJoin({
  trainer: this.homeClientService.getTrainerById('123'),
  packages: this.homeClientService.getPackagesByTrainerProfile('456'),
  programs: this.homeClientService.getProgramsByTrainerProfile('456')
}).subscribe(({ trainer, packages, programs }) => {
  // Use data
});
```

---

## ⚠️ Important Notes

1. **Public Access**: All HomeClient endpoints are unauthenticated (public)
2. **Simplified Data**: TrainerClient has fewer fields than TrainerProfileDetail
3. **Conversion Needed**: Convert TrainerClient → TrainerCard for component display
4. **Missing Fields in TrainerClient**: 
   - No `specializations` (use TrainerProfileService for full details)
   - No `yearsExperience` (use TrainerProfileService)
   - No `startingPrice` (use TrainerProfileService)
   - No `profilePhotoUrl` (use TrainerProfileService)

---

## 🔗 Data Flow Example

```
HomeClientService.search("yoga")
    ↓
HomeClientSearchResponse
    ├─ trainers: TrainerClient[]
    ├─ packages: PackageClient[]
    └─ programs: ProgramClient[]
    
// If displaying in component expecting TrainerCard:
const trainers: TrainerCard[] = trainers.map(t => convertToTrainerCard(t))
```

---

## 📊 API Endpoints Summary

| Operation | Endpoint | Returns |
|-----------|----------|---------|
| Search All | GET `/search?term={term}` | HomeClientSearchResponse |
| All Trainers | GET `/trainers` | TrainerClient[] |
| Trainer by ID | GET `/trainers/{id}` | TrainerClient |
| Trainer Packages | GET `/trainers/{profileId}/packages` | PackageClient[] |
| All Packages | GET `/packages` | PackageClient[] |
| Package by ID | GET `/packages/{id}` | PackageClient |
| Packages by Trainer | GET `/packages/byTrainer/{profileId}` | PackageClient[] |
| Packages by User | GET `/packages/byTrainerUser/{userId}` | PackageClient[] |
| All Programs | GET `/programs` | ProgramClient[] |
| Program by ID | GET `/programs/{id}` | ProgramClient |
| Programs by Trainer Profile | GET `/programs/byTrainerProfile/{profileId}` | ProgramClient[] |
| Programs by User | GET `/programs/byTrainer/{userId}` | ProgramClient[] |

---

## ✅ Implementation Status

- ✅ Models created
- ✅ Service implemented
- ✅ TrainersComponent integrated with dual source support
- ✅ Type safety verified
- ⏳ Package discovery component
- ⏳ Program discovery component
- ⏳ Home page integration

---

## 🎯 Next Steps

1. Create `packages.component.ts` using `homeClientService.getAllPackages()`
2. Create `programs.component.ts` using `homeClientService.getAllPrograms()`
3. Add search integration to home/landing page
4. Create package detail component with `homeClientService.getPackageById()`
5. Add trainer's content discovery on trainer profile page
