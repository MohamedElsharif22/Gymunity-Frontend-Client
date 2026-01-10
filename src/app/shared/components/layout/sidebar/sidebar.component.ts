import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatService } from '../../../../core/services/chat.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  isNew?: boolean;
  color?: string;
  safeIcon?: SafeHtml;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="fixed left-0 top-14 sm:top-16 md:top-20 bottom-0 w-64 md:w-72 bg-white border-r border-gray-200 overflow-y-auto hidden md:flex flex-col shadow-lg z-40 transition-all duration-300">
      <!-- Logo/Brand Section -->
      <div class="p-4 sm:p-5 md:p-6 border-b border-gray-100 bg-gradient-to-br from-sky-50 to-indigo-50">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-200 flex-shrink-0">
            <svg class="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="min-w-0">
            <h2 class="text-gray-900 font-bold text-base sm:text-lg md:text-xl bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent truncate">Gymunity</h2>
            <p class="text-gray-500 text-xs md:text-sm font-medium truncate">Your Fitness Community</p>
          </div>
        </div>
      </div>

      <!-- Main Navigation -->
      <nav class="flex-1 px-3 sm:px-4 md:px-4 py-4 md:py-6 space-y-1.5 md:space-y-2">
        <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 md:mb-4 px-2 md:px-3">
          Main Menu
        </div>

        <a
          *ngFor="let item of mainNavItems"
          [routerLink]="item.route"
          routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg scale-105"
          [routerLinkActiveOptions]="{exact: false}"
          class="group flex items-center justify-between px-3 md:px-4 py-3 md:py-4 rounded-lg md:rounded-xl hover:bg-gradient-to-r hover:from-sky-50 hover:to-indigo-50 hover:text-sky-600 transition-all duration-200 text-gray-700 font-semibold cursor-pointer relative overflow-hidden text-sm md:text-base"
        >
          <span class="flex items-center gap-2 md:gap-3 relative z-10">
            <span [innerHTML]="getSafeIcon(item.icon)" 
                  class="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 group-hover:text-sky-600 flex-shrink-0"
                  [class]="getIconColorClass(item)"></span>
            <span class="group-hover:translate-x-1 transition-transform duration-200 truncate">{{ item.label }}</span>
          </span>
          
          <!-- Badge -->
          <span *ngIf="item.label === 'Messages' ? (unreadMessageCount() > 0) : item.badge" 
                class="relative z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 md:h-6 px-1.5 md:px-2 flex items-center justify-center shadow-lg animate-pulse flex-shrink-0 text-[10px] md:text-xs">
            {{ item.label === 'Messages' ? unreadMessageCount() : item.badge }}
          </span>
          
          <!-- New Label -->
          <span *ngIf="item.isNew" 
                class="relative z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-md flex-shrink-0 text-[10px] md:text-xs">
            NEW
          </span>

          <!-- Arrow on active -->
          <svg routerLinkActive="opacity-100" 
               class="w-4 h-4 md:w-5 md:h-5 opacity-0 absolute right-3 md:right-4 transition-opacity duration-200 flex-shrink-0" 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      </nav>

      <!-- Account Section -->
      <nav class="px-3 sm:px-4 md:px-4 py-3 md:py-4 space-y-1.5 md:space-y-2 border-t border-gray-100 bg-gradient-to-br from-purple-50 to-pink-50">
        <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 md:mb-3 px-2 md:px-3">
          Your Account
        </div>

        <a
          *ngFor="let item of secondaryNavItems"
          [routerLink]="item.route"
          routerLinkActive="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
          [routerLinkActiveOptions]="{exact: false}"
          class="group flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-4 rounded-lg md:rounded-xl hover:bg-white/80 hover:text-purple-600 transition-all duration-200 text-gray-700 font-semibold cursor-pointer relative overflow-hidden text-sm md:text-base"
        >
          <span [innerHTML]="getSafeIcon(item.icon)" 
                class="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 group-hover:text-purple-600 flex-shrink-0"></span>
          <span class="relative z-10 group-hover:translate-x-1 transition-transform duration-200 truncate">{{ item.label }}</span>
        </a>
      </nav>

      <!-- User Profile Section -->
      <div class="p-3 sm:p-4 md:p-4 border-t border-gray-100">
        <a 
          routerLink="/profile" 
          class="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-3 rounded-lg md:rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-sky-500 transition-all cursor-pointer group text-sm md:text-base">
          <div class="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-3 md:ring-4 ring-white group-hover:ring-sky-100 transition-all flex-shrink-0">
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-gray-900 font-bold text-xs md:text-sm truncate">Your Account</p>
            <p class="text-gray-500 text-xs truncate">Manage profile</p>
          </div>
          <svg class="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>

      <!-- Quick Stats Footer -->
      <div class="p-3 sm:p-4 md:p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-t border-gray-100">
        <div class="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-md">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-500">Weekly Goal</span>
            <span class="text-xs font-bold text-sky-600">75%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 md:h-2.5 overflow-hidden">
            <div class="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-sm" 
                 style="width: 75%"></div>
          </div>
          <p class="text-xs text-gray-600 mt-1.5 md:mt-2 text-center">3 of 4 workouts completed</p>
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
  private sanitizer = inject(DomSanitizer);
  private chatService = inject(ChatService);
  
  unreadMessageCount = computed(() => this.chatService.unreadCount());

  mainNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>',
      route: '/dashboard',
      color: 'sky'
    },
    {
      label: 'My Active Programs',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',
      route: '/my-active-programs',
      color: 'indigo'
    },
    {
      label: 'My Body-State Logs',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
      route: '/body-state',
      color: 'purple'
    },
    {
      label: 'My Workout Logs',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
      route: '/workout-logs',
      color: 'green'
    },
    {
      label: 'Subscriptions',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      route: '/subscriptions',
      color: 'amber'
    },
    {
      label: 'Discover Trainers',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>',
      route: '/trainers',
      color: 'orange'
    },
    {
      label: 'Discover Programs',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
      route: '/discover-programs',
      color: 'cyan'
    },
    {
      label: 'Discover Packages',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      route: '/packages',
      color: 'teal'
    },
    {
      label: 'Messages',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>',
      route: '/chat',
      color: 'pink',
      badge: 0
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

  getSafeIcon(iconHtml: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(iconHtml);
  }
}