import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 bg-white shadow-sm z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <a routerLink="/dashboard" class="flex items-center gap-2">
            <div class="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">G</span>
            </div>
            <span class="font-bold text-lg text-gray-900">Gymunity</span>
          </a>

          <!-- Navigation Links -->
          <nav class="hidden md:flex items-center gap-6 flex-1 mx-8">
            <a routerLink="/packages" class="text-gray-700 hover:text-sky-600 font-medium transition">
              Packages
            </a>
          </nav>

          <!-- Search Bar -->
          <div class="flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Search programs, trainers..."
              class="input-field"
            />
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-4">
            <!-- Notifications -->
            <button class="p-2 hover:bg-gray-100 rounded-lg transition">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>

            <!-- Profile Dropdown -->
            <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
              <img
                [src]="currentUser()?.profilePhotoUrl || 'https://via.placeholder.com/40'"
                [alt]="currentUser()?.name"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div class="hidden md:flex flex-col">
                <span class="text-sm font-semibold text-gray-900">{{ currentUser()?.name }}</span>
                <span class="text-xs text-gray-500">Client</span>
              </div>
            </div>

            <!-- Logout Button -->
            <button (click)="logout()" class="p-2 hover:bg-gray-100 rounded-lg transition">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  currentUser = computed(() => this.authService.currentUser());

  ngOnInit() {
    // Computed signal automatically updates
  }

  logout() {
    this.authService.logout();
  }
}
