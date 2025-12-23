# Gymunity Client Application

A modern Angular-based fitness management application built with standalone components, signals, TailwindCSS, and reactive forms.

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/                  # All TypeScript interfaces and types
│   │   │   ├── auth.model.ts         # User, Login, Register
│   │   │   ├── profile.model.ts      # Client Profile, Onboarding
│   │   │   ├── subscription.model.ts # Subscriptions, Packages
│   │   │   ├── program.model.ts      # Programs, Trainers, Exercises
│   │   │   ├── workout.model.ts      # Workout Logs, Body Stats
│   │   │   ├── payment.model.ts      # Payments, Transactions
│   │   │   ├── common.model.ts       # Pagination, API Response
│   │   │   └── index.ts              # Barrel export
│   │   ├── services/
│   │   │   ├── api.service.ts        # HTTP utility methods
│   │   │   ├── auth.service.ts       # Authentication logic
│   │   │   ├── auth.interceptor.ts   # JWT token handling
│   │   │   └── index.ts              # Barrel export
│   │   └── guards/
│   │       └── auth.guard.ts         # Route protection guards
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   └── services/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   └── dashboard.component.ts
│   │   │   └── services/
│   │   │       └── workout-log.service.ts
│   │   │
│   │   ├── memberships/
│   │   │   ├── components/
│   │   │   │   └── memberships.component.ts
│   │   │   └── services/
│   │   │       ├── subscription.service.ts
│   │   │       └── payment.service.ts
│   │   │
│   │   ├── classes/
│   │   │   ├── components/
│   │   │   │   └── classes.component.ts
│   │   │   └── services/
│   │   │       └── program.service.ts
│   │   │
│   │   ├── trainers/
│   │   │   ├── components/
│   │   │   │   └── trainers.component.ts
│   │   │   └── services/
│   │   │       ├── home-client.service.ts
│   │   │       └── review.service.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   │   └── profile.component.ts
│   │   │   └── services/
│   │   │       └── client-profile.service.ts
│   │   │
│   │   └── bookings/
│   │       ├── components/
│   │       │   └── bookings.component.ts
│   │       └── services/
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── layout.component.ts
│   │   │       ├── header/
│   │   │       │   └── header.component.ts
│   │   │       └── sidebar/
│   │   │           └── sidebar.component.ts
│   │   ├── directives/
│   │   └── pipes/
│   │
│   ├── app.routes.ts               # All application routes
│   ├── app.config.ts               # Application configuration
│   ├── app.ts                      # Root component
│   └── app.css                     # Root styles
│
├── environments/
│   ├── environment.ts              # Development config
│   └── environment.prod.ts         # Production config
│
├── styles.css                      # Global styles with TailwindCSS directives
├── index.html                      # HTML entry point
└── main.ts                         # Bootstrap file
```

## 🎨 Styling

This application uses **TailwindCSS** for styling with the following configuration:

- **Colors**: Primary (Sky Blue) and Secondary (Purple) theme
- **Components**: Pre-built utility classes in `styles.css`
  - `.btn-primary` - Primary button
  - `.btn-secondary` - Secondary button
  - `.btn-outline` - Outline button
  - `.card` - Card container
  - `.input-field` - Input field styling

### Installation & Setup

TailwindCSS is already configured. The following files are set up:

- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration
- `src/styles.css` - Global Tailwind directives

## 🔐 Authentication

### Models

- **User**: Authentication user with profile information
- **LoginRequest**: Email/username and password
- **RegisterRequest**: Full registration form with file upload
- **AuthResponse**: Token and user data from server

### Services

- **AuthService**: Login, register, logout, token management
- **AuthInterceptor**: Automatically adds JWT token to requests
- **Auth Guards**: Protect routes, redirect unauthenticated users

### Routes

```typescript
// Public routes (redirect to dashboard if authenticated)
/auth/gilno /
  auth /
  register /
  // Protected routes (require authentication)
  dashboard /
  memberships /
  classes /
  trainers /
  bookings /
  profile /
  settings;
```

## 📊 Core Features

### Dashboard

- View active subscriptions count
- Track workouts this week
- Display current weight from latest body log
- Maintenance streak tracking
- Quick action buttons

### Memberships

- View active and inactive subscriptions
- Browse available packages
- Subscribe to packages
- Cancel/reactivate subscriptions
- Payment history

### Classes & Programs

- Browse all available programs
- Filter by trainer
- View program details (weeks, days, exercises)
- Track program progress

### Trainers

- Search for trainers
- View trainer profiles and packages
- Read trainer reviews and ratings
- Submit reviews for trainers

### Profile Management

- View and update profile information
- Complete onboarding process
- Track body metrics and progress photos
- Change password
- Manage account settings

### Bookings

- Schedule sessions with trainers
- Manage upcoming bookings
- Cancel or reschedule sessions

## 🔌 API Integration

All API calls are handled through the `ApiService` class which wraps Angular's `HttpClient`.

### API Endpoints Used

**Account**

- POST `/api/account/login` - User login
- POST `/api/account/register` - User registration
- PUT `/api/Account/update-profile` - Update profile
- PUT `/api/Account/change-password` - Change password

**Client Subscriptions**

- GET `/api/client/subscriptions` - Get subscriptions
- POST `/api/client/subscriptions/subscribe` - Subscribe to package
- POST `/api/client/subscriptions/{id}/cancel` - Cancel subscription
- POST `/api/client/subscriptions/{id}/reactivate` - Reactivate

**Client Profile**

- GET `/api/client/clientprofile` - Get profile
- POST `/api/client/ClientProfile` - Create profile
- PUT `/api/client/clientprofile/profile` - Update profile
- DELETE `/api/client/clientprofile` - Delete profile

**Workouts & Body Tracking**

- POST `/api/client/WorkoutLog` - Log workout
- GET `/api/client/WorkoutLog` - Get logs
- PUT `/api/client/WorkoutLog/{id}` - Update log
- DELETE `/api/client/WorkoutLog/{id}` - Delete log
- POST `/api/client/BodyStateLog` - Log body state
- GET `/api/client/BodyStateLog` - Get body logs

**Programs**

- GET `/api/trainer/Programs` - Get all programs
- GET `/api/trainer/Programs/{id}` - Get program details
- GET `/api/trainer/Weeks/by-program/{id}` - Get weeks
- GET `/api/trainer/Days/by-week/{id}` - Get days
- GET `/api/trainer/DayExercises/by-day/{id}` - Get exercises

**Trainers**

- GET `/api/HomeClient/search` - Search packages/trainers
- GET `/api/HomeClient/packages` - Get all packages
- GET `/api/HomeClient/trainer/{id}` - Get trainer profile

**Payments**

- POST `/api/client/payments/initiate` - Initiate payment
- GET `/api/client/payments` - Get payment history
- GET `/api/client/payments/{id}` - Get payment details

**Reviews**

- POST `/api/client/ReviewClient/trainer/{id}` - Create review

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Angular CLI (v17+)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure API URL in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://your-api-url',
};
```

3. Start the development server:

```bash
npm start
```

4. Navigate to `http://localhost:4200/`

## 📦 Dependencies

- **Angular 17+** - Core framework
- **TailwindCSS 3+** - Styling
- **RxJS** - Reactive programming
- **TypeScript** - Language

## ✨ Key Features

✅ Standalone Components
✅ Signals for state management
✅ Reactive Forms
✅ Lazy Loading Routes
✅ HTTP Interceptor for JWT
✅ Route Guards for authentication
✅ TailwindCSS Styling
✅ Responsive Design
✅ Type-safe with TypeScript
✅ Modular Architecture

## 🔧 Configuration

### Environment Variables

Update `src/environments/environment.ts` with your API URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7209', // Your API URL
};
```

### Tailwind Config

Customize colors, fonts, and more in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { ... },
      secondary: { ... }
    }
  }
}
```

## 📝 Development Notes

- All components use `changeDetection: ChangeDetectionStrategy.OnPush` for performance
- Services use `providedIn: 'root'` for singleton pattern
- Routes are lazily loaded for better performance
- Use `signals()` and `computed()` for reactive state
- Avoid `ngClass` and `ngStyle`, use class/style bindings instead
- Use `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`

## 🤝 Contributing

Follow Angular best practices and the coding guidelines in `.github/copilot-instructions.md`

## 📄 License

Proprietary - Gymunity Project
