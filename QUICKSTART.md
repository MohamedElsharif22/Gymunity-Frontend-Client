# Quick Start Guide - Gymunity Client Application

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd "Gymunity-client-app"
npm install
```

### Step 2: Configure API URL

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7209', // Your API URL here
};
```

### Step 3: Start Development Server

```bash
npm start
```

### Step 4: Open in Browser

Navigate to: `http://localhost:4200/`

---

## 📁 Project Structure at a Glance

```
✅ Core (Type-safe models & services)
  ├── Models: 7 model files (auth, profile, subscription, program, workout, payment, common)
  ├── Services: API service, Auth service
  └── Guards: Route protection guards

✅ Features (Domain-specific pages & logic)
  ├── Auth: Login & Register pages
  ├── Dashboard: Main dashboard
  ├── Memberships: Subscription management
  ├── Classes: Program browsing
  ├── Trainers: Trainer discovery
  ├── Bookings: Session management
  └── Profile: User profile management

✅ Shared (Reusable components)
  └── Layout: Header, Sidebar, Main container

✅ Styling (TailwindCSS)
  ├── tailwind.config.js: Configuration
  ├── postcss.config.js: CSS processing
  └── styles.css: Global directives & components
```

---

## 🔑 Key Features

| Feature          | Status      | Details                       |
| ---------------- | ----------- | ----------------------------- |
| Authentication   | ✅ Complete | Login, Register, JWT Token    |
| Routing          | ✅ Complete | Lazy loaded, protected routes |
| State Management | ✅ Complete | Signals ready                 |
| HTTP Client      | ✅ Complete | Interceptor for tokens        |
| Styling          | ✅ Complete | TailwindCSS configured        |
| Type Safety      | ✅ Complete | Full TypeScript interfaces    |
| Layout           | ✅ Complete | Header & Sidebar components   |
| Pages            | ✅ Complete | 7 main pages created          |
| Services         | ✅ Complete | 7 feature services            |
| Models           | ✅ Complete | 7 model files                 |

---

## 📍 Available Routes

### Public Routes (No Auth Required)

- `/auth/login` - User login page
- `/auth/register` - User registration page

### Protected Routes (Auth Required)

- `/dashboard` - Main dashboard with stats
- `/memberships` - Manage subscriptions
- `/classes` - Browse programs
- `/trainers` - Find trainers
- `/bookings` - Manage bookings
- `/profile` - User profile
- `/settings` - Account settings

---

## 🛠️ Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests (configure first)
npm test

# Run linting (if configured)
npm run lint

# Format code (if configured)
npm run format
```

---

## 🎨 TailwindCSS Classes

Ready-to-use component classes:

```html
<!-- Buttons -->
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-outline">Outline</button>

<!-- Form -->
<input type="text" class="input-field" />

<!-- Cards -->
<div class="card">Content</div>
```

---

## 🔐 Authentication Flow

```
1. User clicks "Sign In"
   ↓
2. Enters credentials → Login Component
   ↓
3. AuthService.login(credentials)
   ↓
4. API Call to /api/account/login
   ↓
5. Token received & stored in localStorage
   ↓
6. Redirect to /dashboard
   ↓
7. AuthInterceptor adds token to all requests
```

---

## 🌐 API Integration

All API endpoints are integrated through services:

```typescript
// Example: Get subscriptions
this.subscriptionService.getMySubscriptions().subscribe({
  next: (subscriptions) => console.log(subscriptions),
  error: (error) => console.error(error),
});
```

Services available:

- `SubscriptionService` - Membership management
- `PaymentService` - Payment processing
- `ClientProfileService` - Profile management
- `WorkoutLogService` - Workout tracking
- `ProgramService` - Training programs
- `HomeClientService` - Search & discovery
- `ReviewService` - Trainer reviews

---

## ✨ Technology Stack

| Technology  | Version | Purpose         |
| ----------- | ------- | --------------- |
| Angular     | 17+     | Framework       |
| TypeScript  | 5+      | Language        |
| TailwindCSS | 3+      | Styling         |
| RxJS        | 7+      | Reactive        |
| Node        | 18+     | Runtime         |
| npm         | 9+      | Package Manager |

---

## 🐛 Troubleshooting

**Issue**: App not connecting to API

- **Solution**: Check `environment.ts` has correct API URL

**Issue**: Can't login

- **Solution**: Verify backend is running on correct port

**Issue**: Styles not showing

- **Solution**: Run `npm start` to ensure TailwindCSS is processing

**Issue**: Can't find module

- **Solution**: Run `npm install` to install dependencies

---

## 📚 File Organization

**Models** (`src/app/core/models/`)

- Type definitions for all entities
- Organized by domain (auth, profile, subscription, etc.)

**Services** (`src/app/*/services/`)

- API calls and business logic
- Each feature has its own service folder

**Components** (`src/app/*/components/`)

- UI components with templates
- Standalone components

**Routes** (`src/app/app.routes.ts`)

- All application routes
- Lazy loaded modules
- Route guards

---

## 🎯 Next Steps

1. **Customize API URL**

   - Update `src/environments/environment.ts`

2. **Start Development**

   - Run `npm start`
   - Begin implementing features

3. **Add Features**

   - Create components in feature folders
   - Add services for API calls
   - Update routes as needed

4. **Style Customization**

   - Modify `tailwind.config.js` for branding
   - Update color schemes
   - Add custom utilities

5. **Test & Deploy**
   - Test features thoroughly
   - Build with `npm run build`
   - Deploy to hosting

---

## 📖 Documentation Files

- **STRUCTURE.md** - Detailed project structure
- **ARCHITECTURE.md** - Complete architecture guide
- **.github/copilot-instructions.md** - Code guidelines

---

## 💡 Pro Tips

✅ Use the layout component for consistent UI
✅ Always add proper error handling
✅ Use services for API calls
✅ Follow TypeScript strict mode
✅ Keep components focused and small
✅ Use TailwindCSS utilities over custom CSS
✅ Lazy load routes for performance
✅ Use signals for reactive state

---

**Happy Coding! 🚀**

For detailed information, see `ARCHITECTURE.md` and `STRUCTURE.md`
