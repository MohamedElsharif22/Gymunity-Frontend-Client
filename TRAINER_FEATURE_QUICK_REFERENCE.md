# Trainer Feature - Quick Reference Guide

## Quick Start

### For Users
1. **Browse Trainers:** Navigate to `/trainers`
2. **View Profile:** Click "View Profile" on any trainer card
3. **Search/Filter:** Use search bar, specialization filter, experience filter, sorting
4. **From Programs:** Click trainer name on program page → full trainer profile

### For Developers

#### Import Models
```typescript
import { TrainerCard, TrainerProfileDetail } from '@/core/models';
```

#### Use Discovery Service
```typescript
constructor(private discoveryService: TrainerDiscoveryService) {}

ngOnInit() {
  this.discoveryService.searchTrainers().subscribe(response => {
    const trainers: TrainerCard[] = response.data;
    const total: number = response.count;
  });
}
```

#### Use Profile Service
```typescript
constructor(private profileService: TrainerProfileService) {}

loadTrainerProfile(id: number | string) {
  this.profileService.getTrainerProfile(id).subscribe(profile => {
    console.log(profile.handle, profile.yearsExperience);
  });
}
```

#### Display Trainer Card
```html
<div *ngFor="let trainer of trainers">
  <h3>{{ trainer.fullName }}</h3>
  <p>@{{ trainer.handle }}</p>
  <p>{{ trainer.yearsExperience }} years • {{ trainer.ratingAverage.toFixed(1) }}⭐</p>
  <a [routerLink]="['/trainers', trainer.id]">View Profile</a>
</div>
```

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/trainers` | TrainersComponent | Browse and search trainers |
| `/trainers/:trainerId` | TrainerDetailComponent | View full trainer profile |

## API Endpoints

### Client Area
```
GET /api/client/TrainerDiscovery
  Response: { pageIndex, pageSize, count, data: TrainerCard[] }
```

### Trainer Area
```
GET /api/trainer/TrainerProfile/Id/{id}
  Response: TrainerProfileDetail

GET /api/trainer/TrainerProfile/UserId/{userId}
  Response: TrainerProfileDetail

GET /api/trainer/TrainerProfile
  Response: TrainerProfileDetail (current trainer, requires auth)

GET /api/trainer/TrainerProfile/subscribers
  Response: any[] (requires trainer auth)
```

## Data Models

### TrainerCard (List View)
- id, fullName, handle, profilePhotoUrl, coverImageUrl
- bio, isVerified, ratingAverage, totalReviews
- totalClients, yearsExperience, specializations
- startingPrice, currency, hasActiveSubscription

### TrainerProfileDetail (Detail View)
All TrainerCard fields plus:
- userId, userName, email, verifiedAt, isSuspended
- suspendedAt, videoIntroUrl, packages
- createdAt, updatedAt

## Common Tasks

### Search Trainers
```typescript
// Client-side (in component)
filteredTrainers = computed(() => {
  const search = this.searchTerm().toLowerCase();
  return this.trainers().filter(t => 
    t.fullName.toLowerCase().includes(search) ||
    t.handle.toLowerCase().includes(search)
  );
});
```

### Filter by Specialization
```typescript
filtered = this.trainers().filter(trainer => 
  trainer.specializations.includes(selectedSpecialty)
);
```

### Display Trainer Stats
```html
<div class="stats">
  <div>
    <span class="label">Experience:</span>
    <span class="value">{{ trainer.yearsExperience }} years</span>
  </div>
  <div>
    <span class="label">Rating:</span>
    <span class="value">{{ trainer.ratingAverage.toFixed(1) }}★</span>
  </div>
  <div>
    <span class="label">Clients:</span>
    <span class="value">{{ trainer.totalClients }}</span>
  </div>
</div>
```

### Safe Access to Optional Fields
```typescript
// Use optional chaining and nullish coalescing
specializations: trainer?.specializations ?? []
startingPrice: trainer?.startingPrice ?? 0
videoUrl: trainer?.videoIntroUrl ?? null
```

## Troubleshooting

### Issue: Trainer data not loading
**Solution:**
1. Check Network tab - is API returning data?
2. Verify trainer ID is correct
3. Check browser console for error messages
4. Verify authentication token is valid

### Issue: Images not displaying
**Solution:**
1. Check image URLs in API response
2. Verify image paths are correct
3. Check browser DevTools > Network for 404s
4. Ensure CORS is configured correctly

### Issue: Specializations not showing
**Solution:**
1. Verify `specializations` array is not null/undefined
2. Use `trainer?.specializations?.length ?? 0`
3. Filter out empty strings if needed

### Issue: Profile redirect not working
**Solution:**
1. Verify `routerLink="['/trainers', trainer.id]"`
2. Check router configuration in app.routes.ts
3. Verify route guard (profileCompletionGuard) isn't blocking

## Performance Tips

1. **Use OnPush Change Detection** - Already implemented
2. **Lazy Load Routes** - Already implemented
3. **Use Signals** - Already implemented
4. **Unsubscribe Properly** - Use takeUntil with destroy$
5. **Optimize Images** - Use responsive images with srcset

## Styling Notes

- Colors: Blue (#3B82F6) and Purple (#A855F7) gradients
- Spacing: Consistent 4px grid
- Shadows: Light shadows for depth
- Borders: Subtle gray (#E5E7EB)
- Text: Gray-900 for headings, Gray-600 for secondary

## Common Patterns

### Signal-Based State
```typescript
trainer = signal<TrainerProfileDetail | null>(null);
isLoading = signal(false);
error = signal<string | null>(null);

ngOnInit() {
  this.loadTrainer();
}

loadTrainer() {
  this.isLoading.set(true);
  this.service.get().subscribe({
    next: data => {
      this.trainer.set(data);
      this.isLoading.set(false);
    },
    error: err => {
      this.error.set(err.message);
      this.isLoading.set(false);
    }
  });
}
```

### Computed Filtered Results
```typescript
filteredResults = computed(() => {
  const search = this.search().toLowerCase();
  const category = this.category();
  
  return this.items().filter(item => {
    const matchesSearch = item.name.includes(search);
    const matchesCategory = !category || item.category === category;
    return matchesSearch && matchesCategory;
  });
});
```

### Template with Error Handling
```html
@if (isLoading()) {
  <div>Loading...</div>
}
@if (error()) {
  <div>{{ error() }} <button (click)="retry()">Retry</button></div>
}
@if (!isLoading() && !error() && data()) {
  <div>{{ data().name }}</div>
}
@if (!isLoading() && !error() && !data()) {
  <div>No data found</div>
}
```

## Contributing

When adding new features:
1. Follow existing patterns (signals, OnPush, standalone)
2. Add proper TypeScript types
3. Include loading/error/empty states
4. Write console logs for debugging
5. Test on mobile and desktop
6. Update this guide with new patterns

---

**Last Updated:** January 4, 2026
