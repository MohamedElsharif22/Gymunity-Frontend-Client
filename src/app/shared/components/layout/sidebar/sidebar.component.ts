import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  isNew?: boolean;
  color?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="fixed left-0 top-20 md:top-20 bottom-0 w-72 bg-white border-r border-gray-200 overflow-y-auto hidden md:flex flex-col shadow-lg z-40">
      <!-- Logo/Brand Section -->
      <div class="p-6 border-b border-gray-100 bg-gradient-to-br from-sky-50 to-indigo-50">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-200">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-gray-900 font-bold text-xl bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">FitTracker</h2>
            <p class="text-gray-500 text-sm font-medium">Your Fitness Hub</p>
          </div>
        </div>
      </div>

      <!-- Main Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-3">
          Main Menu
        </div>

        <a
          *ngFor="let item of mainNavItems"
          [routerLink]="item.route"
          routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg scale-105"
          [routerLinkActiveOptions]="{exact: false}"
          class="group flex items-center justify-between px-4 py-4 rounded-xl hover:bg-gradient-to-r hover:from-sky-50 hover:to-indigo-50 transition-all duration-200 text-gray-700 font-semibold cursor-pointer relative overflow-hidden"
        >
          <span class="flex items-center gap-3 relative z-10">
            <span [innerHTML]="item.icon" 
                  class="w-6 h-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200"
                  [class]="getIconColorClass(item)"></span>
            <span class="group-hover:translate-x-1 transition-transform duration-200">{{ item.label }}</span>
          </span>
          
          <!-- Badge -->
          <span *ngIf="item.badge" 
                class="relative z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center shadow-lg animate-pulse">
            {{ item.badge }}
          </span>
          
          <!-- New Label -->
          <span *ngIf="item.isNew" 
                class="relative z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            NEW
          </span>

          <!-- Arrow on active -->
          <svg routerLinkActive="opacity-100" 
               class="w-5 h-5 opacity-0 absolute right-4 transition-opacity duration-200" 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      </nav>

      <!-- Account Section -->
      <nav class="px-4 py-4 space-y-2 border-t border-gray-100 bg-gradient-to-br from-purple-50 to-pink-50">
        <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">
          Your Account
        </div>

        <a
          *ngFor="let item of secondaryNavItems"
          [routerLink]="item.route"
          routerLinkActive="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
          [routerLinkActiveOptions]="{exact: false}"
          class="group flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-white/80 transition-all duration-200 text-gray-700 font-semibold cursor-pointer relative overflow-hidden"
        >
          <span [innerHTML]="item.icon" 
                class="w-6 h-6 relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200"></span>
          <span class="relative z-10 group-hover:translate-x-1 transition-transform duration-200">{{ item.label }}</span>
        </a>
      </nav>

      <!-- User Profile Section -->
      <div class="p-4 border-t border-gray-100">
        <a 
          routerLink="/profile" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all cursor-pointer group">
          <div class="w-11 h-11 bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-4 ring-white group-hover:ring-sky-100 transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-gray-900 font-bold text-sm truncate">Your Account</p>
            <p class="text-gray-500 text-xs truncate">Manage profile</p>
          </div>
          <svg class="w-5 h-5 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>

      <!-- Quick Stats Footer -->
      <div class="p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-t border-gray-100">
        <div class="bg-white rounded-xl p-4 shadow-md">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-500">Weekly Goal</span>
            <span class="text-xs font-bold text-sky-600">75%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div class="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-sm" 
                 style="width: 75%"></div>
          </div>
          <p class="text-xs text-gray-600 mt-2 text-center">3 of 4 workouts completed</p>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class SidebarComponent {
  mainNavItems: NavItem[] = [
    {
      label: 'Home',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>',
      route: '/landing',
      color: 'green'
    },
    {
      label: 'Dashboard',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>',
      route: '/dashboard',
      color: 'sky'
    },
    {
      label: 'Body State',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
      route: '/body-state',
      color: 'purple'
    },
    {
      label: 'Workout Logs',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',
      route: '/workout-logs',
      color: 'green'
    },
    {
      label: 'Programs',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',
      route: '/programs',
      color: 'indigo',
      isNew: true
    },
    {
      label: 'Memberships',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>',
      route: '/memberships',
      color: 'blue'
    },
    {
      label: 'Trainers',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>',
      route: '/trainers',
      color: 'orange'
    }
  ];

  secondaryNavItems: NavItem[] = [
    {
      label: 'Onboarding',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      route: '/onboarding'
    }
  ];

  getIconColorClass(item: NavItem): string {
    // Return empty for active state (will be white)
    return '';
  }
}