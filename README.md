# 💪 Gymunity - Fitness Community Platform

![Gymunity Banner](public/images/hero/banner.jpg)

[![Angular](https://img.shields.io/badge/Angular-21-red?logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Application Features](#application-features)
- [Project Structure](#project-structure)
- [Core Services](#core-services)
- [State Management](#state-management)
- [Authentication & Security](#authentication--security)
- [API Integration](#api-integration)
- [Components & Pages](#components--pages)
- [Contributing Guidelines](#contributing-guidelines)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 Overview

**Gymunity** is a modern, comprehensive fitness community platform built with **Angular 21** and **TypeScript**. It connects fitness enthusiasts, personal trainers, and gym members in a dynamic ecosystem designed to transform individual fitness journeys into a collaborative community experience.

The application provides a seamless interface for users to discover trainers, purchase fitness programs and packages, track their workouts, monitor body metrics, engage in real-time chat with trainers, and manage their fitness subscriptions through secure payment integration.

### Vision
To revolutionize the fitness industry by creating a unified platform where trainers and clients can interact, learn, and achieve fitness goals together in a supportive community environment.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **User Registration**: Email-based account creation with validation
- **Secure Login**: JWT-based authentication with token management
- **Google OAuth Integration**: One-click sign-in with Google
- **Password Management**: Secure password reset and change functionality
- **Role-Based Access Control**: Separate interfaces for clients and trainers

### 👥 Trainer Discovery & Management
- **Trainer Directory**: Browse and discover fitness trainers with detailed profiles
- **Advanced Search & Filters**: Search trainers by specialization, experience level, and ratings
- **Trainer Profiles**: Comprehensive trainer information including qualifications and experience
- **Reviews & Ratings**: Community-driven ratings and feedback system for trainers
- **Trainer Packages**: View and purchase specialized training packages

### 📱 Fitness Programs
- **Program Discovery**: Browse comprehensive fitness programs created by professional trainers
- **Personalized Programs**: Get custom-tailored workout programs based on fitness level
- **Program Details**: View detailed program structure, duration, and objectives
- **Program Breakdown**: Navigate through program weeks, days, and individual exercises
- **Active Programs**: Track currently active programs and progress

### 💪 Workout Management
- **Exercise Library**: Extensive collection of exercises with instructions and videos
- **Workout Execution**: Interactive workout interface with real-time guidance
- **Workout Logging**: Record and track completed workouts with detailed metrics
- **Workout History**: View past workouts and performance analytics
- **Exercise Instructions**: Detailed descriptions, form tips, and video demonstrations

### 📊 Body State & Progress Tracking
- **Body Metrics**: Log and track body measurements and weight
- **Progress Visualization**: Charts and graphs to visualize fitness progress
- **Historical Data**: Compare body metrics over time
- **Progress Reports**: Generate comprehensive progress reports
- **Onboarding**: Initial assessment and goal-setting wizard

### 💳 Subscriptions & Payments
- **Membership Packages**: Multiple subscription tiers with flexible options
- **Secure Payment Processing**: Integration with Stripe and PayPal
- **Subscription Management**: View, activate, and manage active subscriptions
- **Payment History**: Track all transactions and receipts
- **Automated Billing**: Recurring payment management

### 💬 Real-Time Communication
- **Live Chat**: Real-time messaging with trainers and other users
- **Chat History**: Persistent conversation history
- **Notifications**: Push notifications for messages and updates
- **Online Status**: Real-time user availability status
- **SignalR Integration**: WebSocket-based real-time communication

### 🔔 Notifications System
- **In-App Notifications**: Real-time alerts and updates
- **Message Notifications**: Get notified of new messages
- **System Updates**: Important platform announcements
- **Subscription Alerts**: Renewal and expiration notifications

### 📱 Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Progressive Web App**: Works offline with cached data
- **Accessible**: WCAG 2.1 AA compliance
- **Dark Mode Ready**: Theme-aware styling

---

## 🛠 Technology Stack

### Frontend Framework
- **Angular 21** - Modern, scalable web application framework
- **TypeScript 5.9** - Strongly typed JavaScript with advanced features
- **RxJS 7.8** - Reactive programming library for async operations

### Styling & UI
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **PostCSS** - CSS transformation tool
- **Responsive Design** - Mobile-first approach

### State Management
- **Angular Signals** - Modern, fine-grained reactivity system
- **Computed Signals** - Derived state management
- **Signal Updates** - Predictable state transformations

### HTTP & API
- **HttpClientModule** - Built-in Angular HTTP client
- **API Interceptors** - Request/response transformation and authentication
- **REST API Integration** - Seamless backend communication

### Real-Time Communication
- **@microsoft/signalr** - SignalR client for real-time bidirectional communication
- **WebSocket** - Low-latency data exchange

### Internationalization
- **@ngx-translate/core** - Multi-language support
- **@ngx-translate/http-loader** - Dynamic language loading

### Build Tools
- **Angular CLI 20** - Command-line interface for development
- **Vite** - Lightning-fast build tool (optional)

### Development & Testing
- **TypeScript Compiler** - Type checking and compilation
- **Vitest 4.0** - Fast unit testing framework
- **JSDOM** - DOM simulation for testing

---

## 🏗 Project Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Components Layer                    │    │
│  │  (Feature Components, Shared Components, Pages)     │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                Services Layer                        │    │
│  │  (API Service, Auth, Chat, Notifications)           │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │             State Management (Signals)              │    │
│  │  (User State, Chat State, Notifications)            │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │        HTTP Client + Auth Interceptors              │    │
│  │  (Request/Response Handling, Token Management)      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │     Backend API (REST + SignalR)     │
        │  - User Service                      │
        │  - Trainer Service                   │
        │  - Program Service                   │
        │  - Payment Service                   │
        │  - Chat Service                      │
        │  - Notification Hub                  │
        └──────────────────────────────────────┘
```

### Module Organization

```
src/app/
├── core/                          # Core application utilities
│   ├── guards/                    # Route guards (auth, profile completion)
│   ├── models/                    # TypeScript interfaces and types
│   ├── services/                  # Core application services
│   └── utils/                     # Utility functions
├── features/                      # Feature modules (lazy-loaded)
│   ├── auth/                      # Authentication (login, register)
│   ├── dashboard/                 # User dashboard and overview
│   ├── profile/                   # User profile management
│   ├── trainers/                  # Trainer discovery and management
│   ├── programs/                  # Fitness programs
│   ├── workout/                   # Workout execution and logging
│   ├── memberships/               # Membership management
│   ├── packages/                  # Package management
│   ├── subscriptions/             # Subscription management
│   ├── payments/                  # Payment processing
│   ├── chat/                      # Real-time messaging
│   ├── client-logs/               # Body state and workout logs
│   ├── home/                      # Home page
│   ├── landing/                   # Landing page
│   └── profession/                # Professional services
└── shared/                        # Shared components and utilities
    └── components/                # Reusable UI components
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v10.9.2 or higher)
- **Angular CLI** (v20 or higher)
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/MohamedElsharif22/Gymunity-Frontend-Client.git
   cd Gymunity-Frontend-Client
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Copy environment template files
   - Update `src/environments/environment.ts` with your API endpoints
   - Update `src/environments/environment.prod.ts` for production

   ```typescript
   // src/environments/environment.ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api',
     trainerUrl: 'http://localhost:5001/api',
     signalRUrl: 'http://localhost:5000',
     stripePublicKey: 'your_stripe_key',
     paypalClientId: 'your_paypal_id'
   };
   ```

4. **Start the Development Server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`

5. **Build for Production**
   ```bash
   npm run build
   ```
   Output will be in the `dist/` directory

---

## 📜 Available Scripts

### Development
```bash
# Start development server with live reload
npm start

# Build application for development
npm run watch
```

### Production
```bash
# Build optimized production bundle
npm run build

# Run production build locally (after npm run build)
npm start
```

### Testing
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Utility Commands
```bash
# Angular CLI
npm run ng -- <command>

# Example: Generate new component
npm run ng -- generate component features/my-component
```

---

## 📚 Application Features

### 1. Authentication System
- **Multi-factor Authentication**: Email verification and password security
- **Session Management**: Automatic token refresh and expiration handling
- **Account Recovery**: Forgot password with email verification
- **Account Update**: Edit profile information and preferences
- **Logout**: Secure session termination

**Routes:**
- `/auth/login` - User login
- `/auth/register` - New user registration
- `/auth/forgot-password` - Password recovery
- `/auth/reset-password` - Password reset

### 2. User Dashboard
Personalized dashboard showing:
- **Quick Stats**: Active programs, completed workouts, body metrics
- **Recent Activity**: Latest workouts and body state logs
- **Upcoming Programs**: Next scheduled workout sessions
- **Quick Actions**: Fast access to common features

**Routes:**
- `/dashboard` - Main dashboard
- `/profile` - User profile management
- `/settings` - Account settings

### 3. Trainer Ecosystem
Comprehensive trainer discovery and interaction:
- **Browse Trainers**: Filter by specialization, location, and ratings
- **Trainer Details**: View qualifications, experience, and achievements
- **Review System**: Read and write trainer reviews
- **Package Purchase**: Buy trainer-specific packages
- **Direct Messaging**: Contact trainers directly

**Routes:**
- `/discover/trainers` - Public trainer directory
- `/trainers` - Authenticated trainer view
- `/trainers/:id` - Trainer profile details
- `/trainers/:id/packages` - Trainer packages
- `/trainers/:id/programs` - Trainer programs

### 4. Fitness Programs
Complete program management system:
- **Program Discovery**: Find programs matching your fitness goals
- **Program Details**: View full program curriculum and structure
- **Enrollment**: Subscribe to and activate programs
- **Progress Tracking**: Monitor program completion and progress
- **Multi-level Structure**: Programs → Weeks → Days → Exercises

**Routes:**
- `/discover-programs` - Program discovery
- `/my-active-programs` - Currently enrolled programs
- `/programs/:id` - Program details
- `/programs/:programId/days/:dayId` - Daily workout details

### 5. Workout Management
Comprehensive workout execution and logging:
- **Live Workout Interface**: Real-time workout guidance
- **Exercise Execution**: Step-by-step exercise instructions
- **Rep/Set Tracking**: Log repetitions, sets, and weights
- **Workout Completion**: Mark workouts as done with statistics
- **Workout History**: Review past workout records

**Routes:**
- `/my-workouts` - Workout history
- `/exercise/:exerciseId/execute` - Workout execution
- `/workout/finish` - Workout completion

### 6. Progress Tracking
Detailed health and fitness metrics:
- **Body State Logging**: Record weight, measurements, and photos
- **Progress Analytics**: Visual progress over time
- **Goal Tracking**: Monitor fitness objectives
- **Body Metrics Timeline**: Historical body state records

**Routes:**
- `/body-state` - Body metrics list
- `/body-state/add` - Add new body metrics
- `/workout-logs` - Workout history
- `/onboarding` - Initial setup wizard

### 7. Membership & Subscriptions
Flexible membership management:
- **Membership Tiers**: Different subscription levels
- **Package Management**: Trainer-specific packages
- **Subscription Status**: View active and expired subscriptions
- **Automatic Renewal**: Configure recurring billing
- **Subscription History**: Track all past subscriptions

**Routes:**
- `/memberships` - Membership browse
- `/packages` - Package discovery
- `/packages/:id` - Package details
- `/subscriptions` - Subscription management

### 8. Payment Processing
Secure, integrated payment system:
- **Stripe Integration**: Credit/debit card payments
- **PayPal Integration**: PayPal payment option
- **Secure Transactions**: PCI-DSS compliant
- **Receipt Management**: Digital receipts and invoices
- **Payment History**: Complete transaction records
- **Error Handling**: Graceful payment failure handling

**Routes:**
- `/payments` - Payment processing
- `/payments/return` - Payment success handler
- `/payments/cancel` - Payment cancellation handler
- `/payment/:id` - Legacy payment interface

### 9. Real-Time Chat
Live communication platform:
- **Direct Messaging**: One-on-one conversations
- **Message History**: Persistent conversation records
- **Typing Indicators**: See when others are typing
- **Online Status**: Real-time user availability
- **Chat Notifications**: Get notified of new messages

**Routes:**
- `/chat` - Chat interface

### 10. Notifications System
Multi-channel notification management:
- **In-App Notifications**: Platform alerts and updates
- **Message Notifications**: New message alerts
- **Subscription Alerts**: Renewal and expiration notices
- **System Announcements**: Important platform updates
- **Real-Time Delivery**: Instant notification delivery

---

## 📁 Project Structure

### Core Directory Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts              # Authentication guard
│   │   │   └── profile-completion.guard.ts # Profile completion guard
│   │   ├── models/
│   │   │   ├── auth.model.ts              # Auth interfaces
│   │   │   ├── chat.model.ts              # Chat interfaces
│   │   │   ├── client-logs.model.ts       # Logs interfaces
│   │   │   ├── client-profile.model.ts    # Profile interfaces
│   │   │   ├── common.model.ts            # Common interfaces
│   │   │   ├── notification.model.ts      # Notification interfaces
│   │   │   ├── payment.model.ts           # Payment interfaces
│   │   │   ├── profile.model.ts           # Profile interfaces
│   │   │   ├── program.model.ts           # Program interfaces
│   │   │   ├── subscription.model.ts      # Subscription interfaces
│   │   │   ├── trainer.model.ts           # Trainer interfaces
│   │   │   ├── workout.model.ts           # Workout interfaces
│   │   │   └── index.ts                   # Export barrel file
│   │   ├── services/
│   │   │   ├── api.service.ts             # REST API service
│   │   │   ├── auth.service.ts            # Authentication service
│   │   │   ├── auth.interceptor.ts        # HTTP auth interceptor
│   │   │   ├── chat.service.ts            # Chat logic service
│   │   │   ├── chat-api.service.ts        # Chat API service
│   │   │   ├── client-logs.service.ts     # Logs management
│   │   │   ├── client-profile.service.ts  # Profile management
│   │   │   ├── google-auth.service.ts     # Google OAuth service
│   │   │   ├── notification.service.ts    # Notification management
│   │   │   └── index.ts                   # Export barrel file
│   │   └── utils/
│   │       └── signal-utils.ts            # Signal utilities
│   ├── features/
│   │   ├── auth/                          # Authentication feature
│   │   │   └── components/
│   │   │       ├── login/
│   │   │       ├── register/
│   │   │       ├── forgot-password/
│   │   │       ├── change-password/
│   │   │       └── reset-password/
│   │   ├── dashboard/                     # Dashboard feature
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── profile/                       # Profile feature
│   │   │   └── components/
│   │   ├── trainers/                      # Trainer discovery
│   │   │   ├── components/
│   │   │   │   ├── trainers.component.*
│   │   │   │   ├── trainer-detail/
│   │   │   │   ├── trainer-packages/
│   │   │   │   └── trainer-programs/
│   │   │   └── services/
│   │   ├── programs/                      # Programs feature
│   │   │   ├── components/
│   │   │   │   ├── discover-programs/
│   │   │   │   ├── program-detail/
│   │   │   │   ├── my-active-programs/
│   │   │   │   ├── program-day-detail/
│   │   │   │   ├── program-details/
│   │   │   │   ├── program-weeks/
│   │   │   │   └── program-days/
│   │   │   └── services/
│   │   ├── workout/                       # Workout execution
│   │   │   ├── components/
│   │   │   │   ├── exercise-execution/
│   │   │   │   ├── my-workouts/
│   │   │   │   └── workout-completion/
│   │   │   └── services/
│   │   ├── memberships/                   # Membership management
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── packages/                      # Package management
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── subscriptions/                 # Subscription feature
│   │   │   └── components/
│   │   ├── payments/                      # Payment processing
│   │   │   ├── components/
│   │   │   │   ├── payment/
│   │   │   │   ├── payment-return/
│   │   │   │   └── payment-cancel/
│   │   │   └── services/
│   │   ├── chat/                          # Real-time chat
│   │   │   └── components/
│   │   │       ├── chat.component.*
│   │   │       ├── chat-list/
│   │   │       └── chat-window/
│   │   ├── client-logs/                   # Progress tracking
│   │   │   └── components/
│   │   │       ├── body-state-list/
│   │   │       ├── body-state-add/
│   │   │       ├── workout-log-list/
│   │   │       ├── workout-log-add/
│   │   │       ├── workout-log-detail/
│   │   │       └── onboarding/
│   │   ├── home/                          # Home feature
│   │   │   └── components/
│   │   ├── landing/                       # Landing page
│   │   │   └── landing.component.ts
│   │   └── profession/                    # Professional services
│   │       └── components/
│   ├── shared/                            # Shared modules
│   │   └── components/
│   │       ├── layout/                    # Main layout component
│   │       ├── guest-layout/              # Guest layout
│   │       ├── exercise-card/             # Exercise card component
│   │       ├── icon/                      # Icon components
│   │       └── [other shared components]
│   ├── app.ts                             # Root component
│   ├── app.routes.ts                      # Routing configuration
│   ├── app.config.ts                      # App configuration
│   ├── app.css                            # Global styles
│   └── app.html                           # Root template
├── environments/
│   ├── environment.ts                     # Default environment
│   ├── environment.development.ts         # Development config
│   └── environment.prod.ts                # Production config
├── main.ts                                # Application entry point
├── styles.css                             # Global styles
└── index.html                             # HTML entry point
├── angular.json                           # Angular CLI config
├── tsconfig.json                          # TypeScript config
├── tsconfig.app.json                      # App-specific TypeScript config
├── tailwind.config.js                     # Tailwind CSS config
├── postcss.config.js                      # PostCSS config
└── package.json                           # NPM dependencies
```

---

## 🔧 Core Services

### 1. API Service
**File:** [src/app/core/services/api.service.ts](src/app/core/services/api.service.ts)

Centralized HTTP client for all API communication:
- REST endpoint management
- Request/response handling
- Error standardization
- Base URL configuration

```typescript
// Usage example
constructor(private apiService: ApiService) {}

getUsers() {
  return this.apiService.get<User[]>('/users');
}
```

### 2. Authentication Service
**File:** [src/app/core/services/auth.service.ts](src/app/core/services/auth.service.ts)

Manages user authentication and authorization:
- User login/register
- JWT token management
- Current user state (signals)
- Password management
- Google OAuth integration

**Key Methods:**
- `login(credentials)` - Authenticate user
- `register(data)` - Create new account
- `logout()` - End user session
- `getCurrentUser()` - Get current user signal
- `isAuthenticated()` - Check auth status
- `changePassword(data)` - Update password

### 3. Chat Service
**File:** [src/app/core/services/chat.service.ts](src/app/core/services/chat.service.ts)

Real-time messaging functionality:
- Message sending/receiving
- Chat history management
- User online status
- Typing indicators
- SignalR connection management

### 4. Chat API Service
**File:** [src/app/core/services/chat-api.service.ts](src/app/core/services/chat-api.service.ts)

Chat-related API endpoints:
- Fetch chat history
- Load chat conversations
- User presence management

### 5. Notification Service
**File:** [src/app/core/services/notification.service.ts](src/app/core/services/notification.service.ts)

Push notification management:
- Real-time notifications
- Notification history
- Notification preferences
- System alerts

### 6. Client Profile Service
**File:** [src/app/core/services/client-profile.service.ts](src/app/core/services/client-profile.service.ts)

User profile management:
- Profile fetching and updating
- Body metrics management
- Profile completion status

### 7. Client Logs Service
**File:** [src/app/core/services/client-logs.service.ts](src/app/core/services/client-logs.service.ts)

Workout and body state logging:
- Workout log creation/retrieval
- Body state tracking
- Progress analytics

### 8. Google Auth Service
**File:** [src/app/core/services/google-auth.service.ts](src/app/core/services/google-auth.service.ts)

Google OAuth integration:
- Google sign-in initialization
- Token verification
- OAuth flow management

---

## 📊 State Management

### Signal-Based Architecture

The application uses **Angular Signals** for state management, providing fine-grained reactivity:

```typescript
// Create signals
private userSignal = signal<User | null>(null);
private loadingSignal = signal<boolean>(false);

// Create computed signals (derived state)
userEmail = computed(() => this.userSignal()?.email ?? '');
isAdmin = computed(() => this.userSignal()?.role === 'admin');

// Update signals
this.userSignal.set(newUser);
this.loadingSignal.update(prev => !prev);
```

### Global State Signals

#### Authentication State
- `currentUser` - Current logged-in user
- `isAuthenticated` - Authentication status
- `isLoading` - Auth loading state
- `userRole` - User's role (client/trainer)

#### Chat State
- `conversations` - Active conversations list
- `currentChat` - Selected conversation
- `messages` - Messages in current chat
- `isTyping` - Typing status

#### Notification State
- `notifications` - List of notifications
- `unreadCount` - Count of unread notifications
- `isLoading` - Loading state

---

## 🔐 Authentication & Security

### Guard-Protected Routes

**Auth Guard** - Protects authenticated routes:
```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent)
}
```

**No Auth Guard** - Prevents authenticated users from accessing auth routes:
```typescript
{
  path: 'auth/login',
  canActivate: [noAuthGuard],
  loadComponent: () => import('./login.component').then(m => m.LoginComponent)
}
```

**Profile Completion Guard** - Ensures profile is completed:
```typescript
{
  path: 'dashboard',
  canActivate: [profileCompletionGuard],
  loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent)
}
```

### HTTP Interceptors

**Auth Interceptor** - Automatically adds JWT tokens to requests:
- Attaches `Authorization` header with bearer token
- Handles token refresh on expiration
- Manages authentication errors

```typescript
// Automatically included in all HTTP requests
GET /api/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Security Features

- **JWT Tokens**: Secure token-based authentication
- **HttpOnly Cookies**: Optional secure cookie storage
- **CORS**: Cross-origin request handling
- **CSRF Protection**: Server-side token validation
- **Input Validation**: Client and server-side validation
- **Error Handling**: Secure error messages (no sensitive info)

---

## 🌐 API Integration

### Base API Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:5000/api',
  trainerUrl: 'http://localhost:5001/api',
  signalRUrl: 'http://localhost:5000'
};
```

### API Endpoints

**Authentication**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/google` - Google OAuth
- `POST /auth/refresh-token` - Token refresh
- `POST /auth/logout` - User logout

**Users**
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update profile
- `POST /users/change-password` - Change password
- `POST /users/reset-password` - Reset password

**Trainers**
- `GET /trainers` - List trainers with pagination
- `GET /trainers/:id` - Get trainer details
- `GET /trainers/:id/packages` - Get trainer packages
- `GET /trainers/:id/programs` - Get trainer programs

**Programs**
- `GET /programs` - List programs
- `GET /programs/:id` - Program details
- `GET /programs/:id/weeks` - Program weeks
- `GET /programs/:id/days` - Program days
- `POST /programs/:id/subscribe` - Subscribe to program

**Workouts**
- `GET /workouts` - Workout history
- `POST /workouts` - Create workout log
- `GET /workouts/:id` - Get workout details
- `PUT /workouts/:id` - Update workout

**Payments**
- `POST /payments/initiate` - Start payment
- `GET /payments/:id` - Get payment status
- `POST /payments/:id/confirm` - Confirm payment

**Chat** (SignalR)
- `Connection` - Establish WebSocket connection
- `SendMessage` - Send chat message
- `ReceiveMessage` - Receive incoming messages
- `UserTyping` - Typing notification

---

## 🧩 Components & Pages

### Standalone Components

All components are **standalone**, following Angular best practices:

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `...`,
  styleUrls: ['...'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {}
```

### Layout Components

#### Main Layout
**File:** [src/app/shared/components/layout/layout.component.ts](src/app/shared/components/layout/layout.component.ts)

Navigation and layout structure:
- Header with navigation
- Sidebar menu
- Content area
- Footer

#### Guest Layout
**File:** [src/app/shared/components/layout/guest-layout.component.ts](src/app/shared/components/layout/guest-layout.component.ts)

Alternative layout for unauthenticated users

### Authentication Components

- **LoginComponent** - User login page
- **RegisterComponent** - User registration
- **ForgotPasswordComponent** - Password recovery
- **ChangePasswordComponent** - Password change
- **ResetPasswordComponent** - Password reset

### Feature Components

#### Dashboard
- Overview of user statistics
- Quick action buttons
- Recent activity feed
- Upcoming programs

#### Profile
- User information editing
- Body metrics display
- Achievement badges
- Settings management

#### Trainers
- Trainer list with filters
- Trainer detail page
- Trainer packages
- Trainer programs
- Review section

#### Programs
- Program discovery
- Program details
- Week/day breakdown
- Exercise list
- Enrollment

#### Workouts
- Workout execution interface
- Exercise instructions
- Rep/set tracking
- Workout completion
- Workout history

#### Chat
- Chat conversation list
- Message window
- Typing indicators
- User status

---

## 📋 Contributing Guidelines

### Code Style

- **Follow Angular Best Practices**: Use standalone components, signals, and OnPush detection
- **TypeScript Strict Mode**: Enable strict type checking
- **Naming Conventions**:
  - Components: `PascalCase` (e.g., `UserProfileComponent`)
  - Files: `kebab-case` (e.g., `user-profile.component.ts`)
  - Variables/Functions: `camelCase` (e.g., `getUserData`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
  - Interfaces: Prefix with `I` (e.g., `IUser`) or use natural naming

### File Structure

```
feature/
├── components/
│   ├── feature.component.ts
│   ├── feature.component.html
│   ├── feature.component.css
│   ├── feature.component.spec.ts
│   └── sub-feature/
│       ├── sub-feature.component.ts
│       └── ...
├── services/
│   ├── feature.service.ts
│   └── feature.service.spec.ts
└── models/
    └── feature.model.ts
```

### Git Workflow

1. Create a feature branch: `git checkout -b feature/description`
2. Make changes and commit: `git commit -m "feat: description"`
3. Push to remote: `git push origin feature/description`
4. Create pull request with detailed description
5. Request reviews from team members
6. Address review comments
7. Merge after approval

### Commit Message Format

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/updates
- `chore:` Build, dependencies

Example: `feat: add user profile update functionality`

---

## ✅ Best Practices

### Angular Development

1. **Standalone Components**: Always use standalone components over NgModules
2. **OnPush Change Detection**: Set `changeDetection: ChangeDetectionStrategy.OnPush`
3. **Signals for State**: Use Angular Signals instead of RxJS subjects for local state
4. **Computed Signals**: Use `computed()` for derived state instead of pipes
5. **Lazy Loading**: Load feature modules on-demand using `loadComponent`
6. **Service Injection**: Use `inject()` function instead of constructor injection

### TypeScript

1. **Strict Types**: Avoid `any`, use `unknown` when type is uncertain
2. **Type Inference**: Let TypeScript infer obvious types
3. **Interfaces**: Use interfaces for object contracts
4. **Enums**: Use const objects instead of enums for better tree-shaking

### Performance

1. **Change Detection**: Use OnPush with signals for better performance
2. **Lazy Loading**: Load feature modules on demand
3. **Code Splitting**: Split bundles for faster initial load
4. **Image Optimization**: Use `NgOptimizedImage` for static images
5. **TrackBy Function**: Use trackBy in `@for` loops
6. **Unsubscribe**: Properly clean up observables (use async pipe when possible)

### Styling

1. **Tailwind CSS**: Use utility classes for styling
2. **No Inline Styles**: Avoid `ngStyle`, use `[style]` bindings
3. **No ngClass**: Use `[class]` bindings instead
4. **Component Scope**: Use component-specific CSS files
5. **Dark Mode**: Design with theme awareness

### Testing

1. **Unit Tests**: Write tests for services and business logic
2. **Component Tests**: Test component behavior and interactions
3. **Coverage**: Aim for >80% code coverage
4. **Mocking**: Mock services and HTTP calls
5. **Integration Tests**: Test feature workflows

### Security

1. **Input Validation**: Validate all user inputs
2. **Output Encoding**: Encode data in templates
3. **HTTPS**: Always use HTTPS in production
4. **Token Storage**: Store JWT in HttpOnly cookies when possible
5. **CORS**: Configure CORS properly
6. **Sanitize HTML**: Use Angular's sanitization methods

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Module Not Found Error
**Problem**: `Cannot find module '@angular/core'`

**Solution**:
```bash
npm install
npm install --save-dev @angular/build @angular/cli @angular/compiler-cli
```

#### 2. Port Already in Use
**Problem**: Port 4200 is already in use

**Solution**:
```bash
# Use a different port
ng serve --port 4300

# Or kill the process using port 4200
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :4200
kill -9 <PID>
```

#### 3. CORS Issues
**Problem**: CORS errors when calling API

**Solution**:
- Ensure backend has CORS enabled
- Check environment.ts for correct API URL
- Verify API uses correct Content-Type headers

#### 4. Authentication Token Issues
**Problem**: Token not being sent with requests

**Solution**:
- Verify token is stored in localStorage
- Check auth interceptor is configured
- Ensure token is not expired
- Check browser console for interceptor errors

#### 5. Build Fails with TypeScript Errors
**Problem**: Type checking errors during build

**Solution**:
```bash
# Check for errors
npx tsc --noEmit

# Fix type issues or use `any` temporarily
# Build without type checking (not recommended)
ng build --configuration development
```

#### 6. Chat/SignalR Connection Issues
**Problem**: Real-time chat not working

**Solution**:
- Verify SignalR URL in environment
- Check browser console for connection errors
- Ensure backend SignalR hub is running
- Verify firewall allows WebSocket connections

#### 7. Payment Integration Not Working
**Problem**: Stripe or PayPal not initializing

**Solution**:
- Verify API keys in environment
- Check payment service initialization
- Ensure SSL/HTTPS in production
- Review payment service logs

### Debug Mode

Enable debug logging:
```typescript
// In app.config.ts
import { enableDebugTools } from '@angular/platform-browser';
import { AppComponent } from './app.component';

platformBrowserDynamic()
  .bootstrapModule(AppComponent)
  .then((moduleRef) => {
    const applicationRef = moduleRef.injector.get(ApplicationRef);
    const componentRef = applicationRef.components[0];
    enableDebugTools(componentRef);
  });
```

### Browser DevTools

1. **Angular DevTools**: Install Angular DevTools extension
2. **Network Tab**: Monitor API calls and responses
3. **Application Tab**: Check localStorage and cookies
4. **Console**: Review errors and warnings
5. **Performance Tab**: Analyze application performance

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Project Team

**Gymunity Frontend Client** is developed as part of the ITI .NET & Angular final project by Mohamed Elsharif and team.

---

## 🙋 Support & Questions

For questions or support:
1. Check existing [GitHub Issues](https://github.com/MohamedElsharif22/Gymunity-Frontend-Client/issues)
2. Review the [documentation](https://github.com/MohamedElsharif22/Gymunity-Frontend-Client/wiki)
3. Create a new issue with detailed information
4. Contact the development team

---

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - User authentication and authorization
  - Trainer discovery and management
  - Fitness programs and workouts
  - Real-time chat and notifications
  - Payment processing integration
  - Progress tracking and analytics

---

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [RxJS Documentation](https://rxjs.dev/)
- [SignalR Documentation](https://learn.microsoft.com/en-us/aspnet/signalr/)
- [Stripe Integration Guide](https://stripe.com/docs)
- [PayPal Integration Guide](https://developer.paypal.com/)

---

<div align="center">

### ⭐ If you find this project helpful, please consider starring it! ⭐

Built with ❤️ for the fitness community

</div>
