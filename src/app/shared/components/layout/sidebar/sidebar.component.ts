import { Component, signal, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
    <!-- Mobile/Tablet Backdrop -->
    @if (isSidebarOpen()) {
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" (click)="closeSidebar()"></div>
    }

    <aside [class]="'fixed left-0 top-20 bottom-0 bg-white border-r border-gray-200 overflow-y-auto flex flex-col shadow-lg transition-all duration-300 ' + (isCollapsed() ? 'w-20' : 'w-72')"
           [ngClass]="{
             'hidden lg:flex': true,
             'flex z-40': isSidebarOpen(),
             'hidden': !isSidebarOpen()
           }">
      <!-- Logo/Brand Section -->
      <div class="p-4 border-b border-gray-100 bg-gradient-to-br from-sky-50 to-indigo-50" [class.justify-center]="isCollapsed()" [class.p-3]="isCollapsed()">
        <div class="flex items-center" [ngClass]="isCollapsed() ? 'justify-center' : 'gap-3'">
          <div class="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-200 flex-shrink-0">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          @if (!isCollapsed()) {
            <div>
              <h2 class="text-gray-900 font-bold text-xl bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">FitTracker</h2>
              <p class="text-gray-500 text-sm font-medium">Your Fitness Hub</p>
            </div>
          }
        </div>
      </div>

      <!-- Main Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1" [class.px-2]="isCollapsed()">
        @if (!isCollapsed()) {
          <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Main Menu
          </div>
        }

        <a
          *ngFor="let item of mainNavItems"
          [routerLink]="item.route"
          routerLinkActive="bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg scale-105"
          [routerLinkActiveOptions]="{exact: false}"
          [title]="isCollapsed() ? item.label : ''"
          class="group flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-sky-50 hover:to-indigo-50 hover:text-sky-600 transition-all duration-200 text-gray-700 font-medium cursor-pointer relative overflow-hidden"
          [ngClass]="isCollapsed() ? 'px-2.5 justify-center' : ''"
        >
          <span class="flex items-center gap-3 relative z-10" [ngClass]="isCollapsed() ? 'flex-col' : ''">
            <span [innerHTML]="getSafeIcon(item.icon)" 
                  class="w-6 h-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 group-hover:text-sky-600 flex-shrink-0"
                  [class]="getIconColorClass(item)"></span>
            @if (!isCollapsed()) {
              <span class="group-hover:translate-x-1 transition-transform duration-200">{{ item.label }}</span>
            }
          </span>
          
          <!-- Badge -->
          @if (item.badge && !isCollapsed()) {
            <span 
                  class="relative z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center shadow-lg animate-pulse">
              {{ item.badge }}
            </span>
          }
          
          <!-- New Label -->
          @if (item.isNew && !isCollapsed()) {
            <span 
                  class="relative z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              NEW
            </span>
          }

          <!-- Arrow on active -->
          <svg routerLinkActive="opacity-100" 
               class="w-5 h-5 opacity-0 absolute right-4 transition-opacity duration-200" 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24"
               [ngClass]="isCollapsed() ? 'hidden' : ''">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      </nav>

      <!-- Account Section -->
      <nav class="px-3 py-3 space-y-1 border-t border-gray-100 bg-gradient-to-br from-purple-50 to-pink-50" [class.px-2]="isCollapsed()">
        @if (!isCollapsed()) {
          <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
            Your Account
          </div>
        }

        <a
          *ngFor="let item of secondaryNavItems"
          [routerLink]="item.route"
          routerLinkActive="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
          [routerLinkActiveOptions]="{exact: false}"
          [title]="isCollapsed() ? item.label : ''"
          class="group flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/80 hover:text-purple-600 transition-all duration-200 text-gray-700 font-medium cursor-pointer relative overflow-hidden"
          [ngClass]="isCollapsed() ? 'px-2.5 justify-center' : ''"
        >
          <span [innerHTML]="getSafeIcon(item.icon)" 
                class="w-6 h-6 relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 group-hover:text-purple-600 flex-shrink-0"></span>
          @if (!isCollapsed()) {
            <span class="relative z-10 group-hover:translate-x-1 transition-transform duration-200">{{ item.label }}</span>
          }
        </a>
      </nav>

      <!-- User Profile Section -->
      <div class="p-3 border-t border-gray-100" [class.flex]="isCollapsed()" [class.justify-center]="isCollapsed()">
        <a 
          routerLink="/profile" 
          [title]="isCollapsed() ? 'Your Account' : ''"
          class="flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-sky-500 transition-all cursor-pointer group"
          [ngClass]="isCollapsed() ? 'flex-col' : ''">
          <div class="w-11 h-11 bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-4 ring-white group-hover:ring-sky-100 transition-all flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          @if (!isCollapsed()) {
            <div class="flex-1 min-w-0">
              <p class="text-gray-900 font-bold text-sm truncate">Your Account</p>
              <p class="text-gray-500 text-xs truncate">Manage profile</p>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          }
        </a>
      </div>

      <!-- Quick Stats Footer -->
      <div class="p-3 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-t border-gray-100" [class.hidden]="isCollapsed()">
        <div class="bg-white rounded-lg p-3 shadow-md">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-semibold text-gray-500">Weekly Goal</span>
            <span class="text-xs font-bold text-sky-600">75%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div class="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-sm" 
                 style="width: 75%"></div>
          </div>
          <p class="text-xs text-gray-600 mt-1.5 text-center">3 of 4 workouts completed</p>
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
  readonly isCollapsed = input(false);
  readonly isSidebarOpen = input(false);
  readonly onCloseSidebar = output<void>();

  closeSidebar(): void {
    this.onCloseSidebar.emit();
  }

  mainNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>',
      route: '/dashboard',
      color: 'sky'
    },
    {
      label: 'My Body-State Logs',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
      route: '/body-state',
      color: 'purple'
    },
    {
      label: 'My Workout Logs',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',
      route: '/workout-logs',
      color: 'green'
    },
    {
      label: 'My Subscription',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
      route: '/subscriptions'
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
      route: '/packages'
    },
    {
      label: 'Messages',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>',
      route: '/chat',
      color: 'pink',
      isNew: true
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