import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-md w-full">
      <!-- Main Navbar Container -->
      <div class="w-full h-14 sm:h-16 md:h-20 px-3 sm:px-4 md:px-6 lg:px-8">
        <div class="flex items-center justify-between h-full w-full max-w-7xl mx-auto">
          
          <!-- LEFT: Logo + Brand -->
          <div class="flex items-center gap-0 flex-shrink-0 min-w-fit">
            <a routerLink="/dashboard" class="flex items-center gap-1.5 sm:gap-2 md:gap-3 group">
              <!-- Logo Icon -->
              <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-200 flex-shrink-0">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              
              <!-- Brand Text (Hidden on xs) -->
              <div class="hidden sm:block">
                <h1 class="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
                  Gymunity
                </h1>
                <p class="text-xs text-gray-500 font-medium hidden md:block">Fitness Community</p>
              </div>
            </a>
            
            <!-- Brand Dropdown Button -->
            <div class="relative group hidden sm:block">
              <button class="flex items-center justify-center p-1.5 sm:p-2 ml-1 sm:ml-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
                <svg class="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 group-hover:text-sky-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Brand Dropdown Menu -->
              <div class="absolute left-0 mt-0 top-full bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-1 translate-y-0 w-48 z-50">
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
          </div>
          
          <!-- CENTER: Desktop Navigation -->
          <nav class="hidden lg:flex items-center gap-1 flex-1 justify-center mx-6">
            <a routerLink="/dashboard"
               routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg"
               [routerLinkActiveOptions]="{ exact: true }"
               class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all duration-200 whitespace-nowrap">
              Dashboard
            </a>
            <a routerLink="/my-active-programs"
               routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg"
               [routerLinkActiveOptions]="{ exact: false }"
               class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all duration-200 whitespace-nowrap">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              Programs
            </a>
          </nav>
          
          <!-- RIGHT: User Actions & Menu -->
          <div class="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
            <!-- Notifications Button -->
            <button class="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-sky-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <!-- User Profile Menu (Desktop) -->
            <div class="hidden md:block relative">
              <button 
                (click)="toggleDesktopDropdown()"
                class="flex items-center gap-2 pl-3 ml-2 border-l border-gray-200 hover:bg-gray-50 rounded-r-lg p-1 transition-all flex-shrink-0">
                @if (currentUser()?.profilePhotoUrl) {
                  <img
                    [src]="currentUser()?.profilePhotoUrl"
                    [alt]="currentUser()?.name"
                    class="w-8 h-8 rounded-full object-cover ring-1.5 ring-white shadow-sm"
                  />
                } @else {
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm ring-1.5 ring-white text-xs">
                    {{ getUserInitial() }}
                  </div>
                }
                <div class="hidden lg:block text-left">
                  <p class="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[100px]">{{ currentUser()?.name }}</p>
                  <p class="text-xs text-gray-500">Client</p>
                </div>
                <svg [class.rotate-180]="showDesktopDropdown()" class="w-4 h-4 text-gray-400 hidden lg:block transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <!-- Desktop Dropdown Menu -->
              @if (showDesktopDropdown()) {
                <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 transition-all duration-200 z-50">
                  <!-- User Info Header -->
                  <div class="p-4 border-b border-gray-100 bg-gradient-to-br from-sky-50 to-indigo-50 rounded-t-xl">
                    <div class="flex items-center gap-3 mb-2">
                      @if (currentUser()?.profilePhotoUrl) {
                        <img
                          [src]="currentUser()?.profilePhotoUrl"
                          [alt]="currentUser()?.name"
                          class="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                      } @else {
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                          {{ getUserInitial() }}
                        </div>
                      }
                      <div class="flex-1 min-w-0">
                        <p class="font-bold text-sm text-gray-900 truncate">{{ currentUser()?.name }}</p>
                        <p class="text-xs text-gray-600 truncate">{{ currentUser()?.email }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Menu Items -->
                  <div class="py-2">
                    <a routerLink="/profile"
                       (click)="closeDropdowns()"
                       class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-sky-50 transition group">
                      <div class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center group-hover:bg-sky-200 transition flex-shrink-0">
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
                       (click)="closeDropdowns()"
                       class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition group">
                      <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition flex-shrink-0">
                        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                      </div>
                      <div>
                        <p class="font-semibold text-sm">Body Stats</p>
                        <p class="text-xs text-gray-500">Track your progress</p>
                      </div>
                    </a>

                    <!-- Logout Button -->
                    <div class="p-2 border-t border-gray-100">
                      <button
                        (click)="logout()"
                        class="flex items-center gap-3 w-full px-4 py-3 text-gray-900 hover:bg-gray-200 rounded-lg transition font-semibold">
                        <div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition flex-shrink-0">
                          <svg class="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                          </svg>
                        </div>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Mobile Menu Button (Hamburger) -->
            <button
              (click)="toggleMobileMenu()"
              class="md:hidden p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
              @if (!showMobileMenu()) {
                <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              } @else {
                <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              }
            </button>

            <!-- Mobile Profile Avatar (sm to md only) -->
            <div class="md:hidden relative flex-shrink-0">
              <button
                (click)="toggleMobileDropdown()"
                class="flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 transition">
                @if (currentUser()?.profilePhotoUrl) {
                  <img
                    [src]="currentUser()?.profilePhotoUrl"
                    [alt]="currentUser()?.name"
                    class="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-1.5 ring-white shadow-sm"
                  />
                } @else {
                  <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ring-1.5 ring-white text-xs">
                    {{ getUserInitial() }}
                  </div>
                }
              </button>

              <!-- Mobile Dropdown Menu -->
              @if (showMobileDropdown()) {
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 transition-all duration-200 z-50">
                  <!-- User Info Header -->
                  <div class="p-3 border-b border-gray-100 bg-gradient-to-br from-sky-50 to-indigo-50 rounded-t-xl">
                    <div class="flex items-center gap-2 mb-1.5">
                      @if (currentUser()?.profilePhotoUrl) {
                        <img
                          [src]="currentUser()?.profilePhotoUrl"
                          [alt]="currentUser()?.name"
                          class="w-10 h-10 rounded-full object-cover ring-1.5 ring-white shadow-sm"
                        />
                      } @else {
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ring-1.5 ring-white text-xs">
                          {{ getUserInitial() }}
                        </div>
                      }
                      <div class="flex-1 min-w-0">
                        <p class="font-bold text-xs text-gray-900 truncate">{{ currentUser()?.name }}</p>
                        <p class="text-xs text-gray-600 truncate">{{ currentUser()?.email }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Menu Items -->
                  <div class="py-1">
                    <a routerLink="/profile"
                       (click)="closeDropdowns()"
                       class="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-sky-50 transition">
                      <div class="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      <span class="font-semibold">Profile</span>
                    </a>

                    <a routerLink="/body-state"
                       (click)="closeDropdowns()"
                       class="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-purple-50 transition">
                      <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                      </div>
                      <span class="font-semibold">Body Stats</span>
                    </a>

                    <button
                      (click)="logout()"
                      class="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-900 hover:bg-gray-200 rounded transition font-semibold">
                      <div class="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                      </div>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Menu (Full Width Below Header) -->
      @if (showMobileMenu()) {
        <div class="md:hidden border-t border-gray-200 bg-white">
          <nav class="px-3 py-3 space-y-2 max-w-7xl mx-auto">
            <a routerLink="/dashboard"
               (click)="toggleMobileMenu()"
               routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
               [routerLinkActiveOptions]="{ exact: true }"
               class="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
              Dashboard
            </a>
            <a routerLink="/my-active-programs"
               (click)="toggleMobileMenu()"
               routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
               [routerLinkActiveOptions]="{ exact: false }"
               class="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
              My Programs
            </a>
            <a routerLink="/trainers"
               (click)="toggleMobileMenu()"
               routerLinkActive="bg-gradient-to-r from-orange-500 to-red-600 text-white"
               [routerLinkActiveOptions]="{ exact: false }"
               class="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
              Trainers
            </a>
            <a routerLink="/chat"
               (click)="toggleMobileMenu()"
               routerLinkActive="bg-gradient-to-r from-pink-500 to-rose-600 text-white"
               [routerLinkActiveOptions]="{ exact: false }"
               class="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
              Messages
            </a>
          </nav>
        </div>
      }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  showMobileMenu = signal(false);
  showDesktopDropdown = signal(false);
  showMobileDropdown = signal(false);

  ngOnInit() {
    // Initialize any needed data here
  }

  getUserInitial(): string {
    const name = this.currentUser()?.name || 'U';
    return name.charAt(0).toUpperCase();
  }

  toggleMobileMenu() {
    this.showMobileMenu.update(val => !val);
  }

  toggleDesktopDropdown() {
    this.showDesktopDropdown.update(val => !val);
    this.showMobileDropdown.set(false);
  }

  toggleMobileDropdown() {
    this.showMobileDropdown.update(val => !val);
    this.showDesktopDropdown.set(false);
  }

  closeDropdowns() {
    this.showDesktopDropdown.set(false);
    this.showMobileDropdown.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
