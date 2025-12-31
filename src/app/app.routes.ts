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
