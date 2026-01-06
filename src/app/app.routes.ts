import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { profileCompletionGuard } from './core/guards/profile-completion.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  // Landing page - accessible to everyone (NO GUARDS)
  {
    path: 'landing',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  // Root redirect to landing
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  // Protected routes requiring authentication
  {
    path: '',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/components').then(m => m.ProfileComponent)
      },
      {
        path: 'dashboard',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/dashboard/components/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'memberships',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/memberships/components/memberships.component').then(m => m.MembershipsComponent)
      },
      {
        path: 'trainers',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/trainers/components/trainers.component').then(m => m.TrainersComponent)
      },
      {
        path: 'trainers/:id',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/trainers/components/trainer-detail/trainer-detail.component').then(m => m.TrainerDetailComponent)
      },
      {
        path: 'discover-programs',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/programs/components/discover-programs/discover-programs.component').then(m => m.DiscoverProgramsComponent)
      },
      {
        path: 'programs/:id',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/programs/components/program-detail/program-detail.component').then(m => m.ProgramDetailComponent)
      },
      {
        path: 'programs/:programId/days/:dayId',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/programs/components/program-day-detail/program-day-detail.component').then(m => m.ProgramDayDetailComponent)
      },
      {
        path: 'packages',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/packages/components/packages.component').then(m => m.PackagesComponent)
      },
      {
        path: 'packages/:id',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/packages/components/package-subscribe/package-subscribe.component').then(m => m.PackageSubscribeComponent)
      },
      {
        path: 'subscriptions',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent)
      },
      {
        path: 'payment/:id',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/payments/components/payment/payment.component').then(m => m.PaymentComponent)
      },
      {
        path: 'payment/success',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/payments/components/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent)
      },
      {
        path: 'payment/failed',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/payments/components/payment-failed/payment-failed.component').then(m => m.PaymentFailedComponent)
      },
      {
        path: 'payment/canceled',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/payments/components/payment-canceled/payment-canceled.component').then(m => m.PaymentCanceledComponent)
      },
      {
        path: 'payment/error',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/payments/components/payment-error/payment-error.component').then(m => m.PaymentErrorComponent)
      },
      {
        path: 'settings',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/profile/components').then(m => m.ProfileComponent)
      },
      // Client Logs Feature Routes (Body State, Workout, Onboarding)
      {
        path: 'body-state',
        canActivate: [profileCompletionGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/client-logs/components/body-state-list/body-state-list.component').then(m => m.BodyStateListComponent)
          },
          {
            path: 'add',
            loadComponent: () => import('./features/client-logs/components/body-state-add/body-state-add.component').then(m => m.BodyStateAddComponent)
          }
        ]
      },
      {
        path: 'onboarding',
        loadComponent: () => import('./features/client-logs/components/onboarding/onboarding.component').then(m => m.OnboardingComponent)
      },
      {
        path: 'workout-logs',
        canActivate: [profileCompletionGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/client-logs/components/workout-log-list/workout-log-list.component').then(m => m.WorkoutLogListComponent)
          },
          {
            path: 'add',
            loadComponent: () => import('./features/client-logs/components/workout-log-add/workout-log-add.component').then(m => m.WorkoutLogAddComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/client-logs/components/workout-log-detail/workout-log-detail.component').then(m => m.WorkoutLogDetailComponent)
          }
        ]
      },
      // Client Programs Feature Routes
      {
        path: 'programs',
        canActivate: [authGuard],
        children: [
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
      },
      {
        path: 'exercise/:exerciseId/execute',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/workout/components/exercise-execution/exercise-execution.component').then(m => m.ExerciseExecutionComponent)
      },
      {
        path: 'my-workouts',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/workout/components/my-workouts/my-workouts.component').then(m => m.MyWorkoutsComponent)
      },
      {
        path: 'workout/finish',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/workout/components/workout-completion/workout-completion.component').then(m => m.WorkoutCompletionComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  // Catch all - redirect to landing
  {
    path: '**',
    redirectTo: '/landing'
  }
];
