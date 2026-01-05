import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { profileCompletionGuard } from './core/guards/profile-completion.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
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
  {
    path: '',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/components/profile.component').then(m => m.ProfileComponent)
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
        path: 'classes',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/classes/components/classes.component').then(m => m.ClassesComponent)
      },
      {
        path: 'trainers',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/trainers/components/trainers.component').then(m => m.TrainersComponent)
      },
      {
        path: 'programs',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/programs/components/programs.component').then(m => m.ProgramsComponent)
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
        path: 'bookings',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/bookings/components/bookings.component').then(m => m.BookingsComponent)
      },
      {
        path: 'settings',
        canActivate: [profileCompletionGuard],
        loadComponent: () => import('./features/profile/components/profile.component').then(m => m.ProfileComponent)
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
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
