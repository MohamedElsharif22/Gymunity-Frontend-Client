import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-white shadow-md sticky top-0 z-50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
              Gymunity
            </h1>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <a
              routerLink="/dashboard"
              routerLinkActive="border-b-2 border-green-600 text-green-600"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-slate-600 hover:text-green-600 font-medium transition px-2 py-1">
              Dashboard
            </a>
            <a
              routerLink="/subscriptions"
              routerLinkActive="border-b-2 border-green-600 text-green-600"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-slate-600 hover:text-green-600 font-medium transition px-2 py-1">
              My Programs
            </a>
            <a
              routerLink="/workout"
              routerLinkActive="border-b-2 border-green-600 text-green-600"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-slate-600 hover:text-green-600 font-medium transition px-2 py-1">
              Workout
            </a>
            <a
              routerLink="/profile"
              routerLinkActive="border-b-2 border-green-600 text-green-600"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-slate-600 hover:text-green-600 font-medium transition px-2 py-1">
              Profile
            </a>
          </div>

          <!-- User Actions -->
          <div class="flex items-center space-x-4">
            <button
              (click)="logout()"
              class="px-4 py-2 text-gray-900 hover:bg-gray-200 font-medium transition bg-gray-200 rounded-lg">
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  `
})
export class HeaderComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
