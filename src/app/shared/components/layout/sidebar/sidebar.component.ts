import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:flex flex-col">
      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
          Main
        </div>

        <a
          *ngFor="let item of mainNavItems"
          [routerLink]="item.route"
          routerLinkActive="bg-sky-50 border-r-4 border-sky-600 text-sky-600"
          class="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
        >
          <span class="flex items-center gap-3">
            <span [innerHTML]="item.icon" class="w-5 h-5"></span>
            {{ item.label }}
          </span>
          <span *ngIf="item.badge" class="bg-sky-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {{ item.badge }}
          </span>
        </a>
      </nav>

      <!-- Secondary Navigation -->
      <nav class="px-4 py-6 space-y-2 border-t border-gray-200">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
          Account
        </div>

        <a
          *ngFor="let item of secondaryNavItems"
          [routerLink]="item.route"
          routerLinkActive="bg-sky-50 border-r-4 border-sky-600 text-sky-600"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
        >
          <span [innerHTML]="item.icon" class="w-5 h-5"></span>
          {{ item.label }}
        </a>
      </nav>
    </aside>
  `,
  styles: []
})
export class SidebarComponent {
  mainNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m2-2l6.414-6.414a2 2 0 012.828 0L19 9m-2-2l2 2m0 0V7a2 2 0 00-2-2h-.5a2 2 0 00-2 2v2.5"></path></svg>',
      route: '/dashboard'
    },
    {
      label: 'Memberships',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      route: '/memberships'
    },
    {
      label: 'Classes',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>',
      route: '/classes'
    },
    {
      label: 'Trainers',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9m6 0h.01"></path></svg>',
      route: '/trainers'
    },
    {
      label: 'Bookings',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>',
      route: '/bookings'
    }
  ];

  secondaryNavItems: NavItem[] = [
    {
      label: 'Profile',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>',
      route: '/profile'
    },
    {
      label: 'Settings',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
      route: '/settings'
    }
  ];
}
