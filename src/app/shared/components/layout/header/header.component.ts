import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ProgramService } from '../../../../features/programs/services/program.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 md:h-20">
          <!-- Logo/Brand with Dropdown -->
          <div class="flex items-center gap-0 group shrink-0 relative">
            <a routerLink="/dashboard" class="flex items-center gap-3 group shrink-0">
              <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-200">
                <svg class="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="hidden sm:block">
                <h1 class="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                  Gymunity
                </h1>
                <p class="text-xs text-gray-500 font-medium hidden md:block">Your Fitness Community</p>
              </div>
            </a>
            <!-- Brand Dropdown -->
            <button class="hidden sm:flex items-center justify-center p-2 ml-2 hover:bg-gray-100 rounded-lg transition group-hover:bg-gray-100">
              <svg class="w-4 h-4 text-gray-600 group-hover:text-sky-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <!-- Brand Dropdown Menu -->
            <div class="hidden sm:block absolute left-0 mt-0 top-full bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-1 translate-y-0 w-48 z-50">
              <a routerLink="/landing" 
                 class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-sky-50 transition group border-b border-gray-100 first:rounded-t-xl">
                <div class="w-9 h-9 bg-sky-100 rounded-lg flex items-center justify-center group-hover:bg-sky-200 transition">
                  <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-sm">Home</p>
                  <p class="text-xs text-gray-500">Back to landing</p>
                </div>
              </a>
              <a routerLink="/trainers" 
                 class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 transition group border-b border-gray-100 last:rounded-b-xl">
                <div class="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition">
                  <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-sm">Explore Trainers</p>
                  <p class="text-xs text-gray-500">Find trainers</p>
                </div>
              </a>
            </div>
          </div>

          <!-- Center Navigation (Desktop) -->
          <nav class="hidden lg:flex items-center gap-2 flex-1 mx-8 justify-center">
            <a routerLink="/dashboard" 
               routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg"
               class="px-4 py-2.5 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-200">
              Dashboard
            </a>
            <a routerLink="/packages" 
               routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg"
               class="px-4 py-2.5 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-200">
              Packages
            </a>
            <a routerLink="/trainers" 
               routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg"
               class="px-4 py-2.5 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-200">
              Trainers
            </a>
          </nav>

          <!-- Search Bar (Desktop/Tablet) -->
          <div class="hidden md:flex flex-1 max-w-md mx-4">
            <div class="relative w-full">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search programs, trainers..."
                [(ngModel)]="searchQuery"
                (input)="onSearch()"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <!-- Right Actions -->
          <div class="flex items-center gap-2 md:gap-3">
            <!-- Search Icon (Mobile) -->
            <button 
              (click)="toggleMobileSearch()"
              class="md:hidden p-2 hover:bg-gray-100 rounded-lg transition">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>

            <!-- My Active Programs Icon -->
            <div class="relative group">
              <button (click)="navigateToActivePrograms()" class="relative p-2 hover:bg-gray-100 rounded-xl transition group cursor-pointer">
                <svg class="w-6 h-6 text-gray-600 group-hover:text-sky-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                @if (activePrograms().length > 0) {
                  <span class="absolute top-1 right-1 w-5 h-5 bg-sky-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {{ activePrograms().length }}
                  </span>
                }
              </button>
              <!-- Tooltip -->
              <div class="absolute right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -bottom-12 z-50">
                My Active Programs ({{ activePrograms().length }})
              </div>
            </div>

            <!-- Notifications -->
            <button class="relative p-2 hover:bg-gray-100 rounded-xl transition group">
              <svg class="w-6 h-6 text-gray-600 group-hover:text-sky-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <!-- User Menu -->
            <div class="relative group">
              <button class="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 ml-3 md:ml-4 border-l border-gray-200 hover:bg-gray-50 rounded-r-xl pr-2 py-1 transition-all">
                @if (currentUser()?.profilePhotoUrl) {
                  <img 
                    [src]="currentUser()?.profilePhotoUrl" 
                    [alt]="currentUser()?.name"
                    class="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-white shadow-md"
                  />
                } @else {
                  <div class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                    {{ getUserInitial() }}
                  </div>
                }
                <div class="hidden lg:block text-left">
                  <p class="text-sm font-semibold text-gray-900 leading-tight">{{ currentUser()?.name }}</p>
                  <p class="text-xs text-gray-500 capitalize">Client</p>
                </div>
                <svg class="w-4 h-4 text-gray-400 hidden md:block group-hover:text-gray-600 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                <!-- User Info Header -->
                <div class="p-4 border-b border-gray-100 bg-gradient-to-br from-sky-50 to-indigo-50 rounded-t-2xl">
                  <div class="flex items-center gap-3 mb-2">
                    @if (currentUser()?.profilePhotoUrl) {
                      <img 
                        [src]="currentUser()?.profilePhotoUrl" 
                        [alt]="currentUser()?.name"
                        class="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                      />
                    } @else {
                      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                        {{ getUserInitial() }}
                      </div>
                    }
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-gray-900 truncate">{{ currentUser()?.name }}</p>
                      <p class="text-xs text-gray-600 truncate">{{ currentUser()?.email }}</p>
                    </div>
                  </div>
                </div>

                <!-- Menu Items -->
                <div class="py-2">
                  <a routerLink="/profile" 
                     class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-sky-50 transition group">
                    <div class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center group-hover:bg-sky-200 transition">
                      <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold text-sm">My Profile</p>
                      <p class="text-xs text-gray-500">View and edit profile</p>
                    </div>
                  </a>
                  
                  <a routerLink="/body-state" 
                     class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition group">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
                      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold text-sm">Body Stats</p>
                      <p class="text-xs text-gray-500">Track your progress</p>
                    </div>
                  </a>
                  
                  <a routerLink="/memberships" 
                     class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 transition group">
                    <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition">
                      <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold text-sm">Subscriptions</p>
                      <p class="text-xs text-gray-500">Manage memberships</p>
                    </div>
                  </a>
                </div>

                <!-- Logout Button -->
                <div class="p-2 border-t border-gray-100">
                  <button 
                    (click)="logout()" 
                    class="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-semibold group">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition">
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                    </div>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Mobile Menu Button -->
            <button 
              (click)="toggleMobileMenu()"
              class="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition">
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Search Bar -->
        @if (showMobileSearch()) {
          <div class="pb-4 md:hidden">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search programs, trainers..."
                [(ngModel)]="searchQuery"
                (input)="onSearch()"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
            </div>
          </div>
        }
      </div>

      <!-- Mobile Navigation Menu -->
      @if (showMobileMenu()) {
        <div class="lg:hidden border-t border-gray-200 bg-white">
          <nav class="px-4 py-4 space-y-2">
            <a routerLink="/dashboard" 
               (click)="toggleMobileMenu()"
               routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
               class="block px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition">
              Dashboard
            </a>
            <a routerLink="/packages" 
               (click)="toggleMobileMenu()"
               routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
               class="block px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition">
              Packages
            </a>
            <a routerLink="/programs" 
               (click)="toggleMobileMenu()"
               routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
               class="block px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition">
              Programs
            </a>
            <a routerLink="/trainers" 
               (click)="toggleMobileMenu()"
               routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
               class="block px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition">
              Trainers
            </a>
          </nav>
        </div>
      }
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private programService = inject(ProgramService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  
  currentUser = this.authService.currentUser;
  searchQuery = signal('');
  showMobileSearch = signal(false);
  showMobileMenu = signal(false);
  activePrograms = signal<any[]>([]);

  ngOnInit() {
    this.loadActivePrograms();
  }

  private loadActivePrograms() {
    this.programService.getActivePrograms()
      .pipe(
        catchError((err: any) => {
          console.warn('Error loading active programs, falling back to all programs:', err);
          return this.programService.getPrograms();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (programs: any[]) => {
          this.activePrograms.set(programs);
        },
        error: (err: any) => {
          console.error('Error loading programs:', err);
        }
      });
  }

  getUserInitial(): string {
    const name = this.currentUser()?.name || 'U';
    return name.charAt(0).toUpperCase();
  }

  onSearch() {
    console.log('Searching for:', this.searchQuery());
    // Implement search logic here
  }

  toggleMobileSearch() {
    this.showMobileSearch.update(val => !val);
  }

  toggleMobileMenu() {
    this.showMobileMenu.update(val => !val);
  }

  navigateToActivePrograms() {
    this.router.navigate(['/my-active-programs']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}