import { Component, OnInit, inject, signal, computed, DestroyRef, HostListener, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ChatService } from '../../../../core/services/chat.service';

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
            <!-- Notifications Button with Dropdown -->
            <div class="relative">
              <button 
                aria-label="notifications"
                (click)="toggleNotificationDropdown()"
                class="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0 group">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-sky-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                @if (unreadNotificationCount() > 0) {
                  <span class="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full animate-pulse flex items-center justify-center text-xs text-white font-bold">{{ unreadNotificationCount() }}</span>
                }
              </button>

              <!-- Notification Dropdown Panel -->
              @if (showNotificationDropdown()) {
                <div class="notification-dropdown absolute right-0 top-full mt-3 w-96 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <!-- Dropdown Header -->
                <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100">
                  <div>
                    <h3 class="font-bold text-gray-900 text-base">Activity Center</h3>
                    <p class="text-xs text-gray-500 mt-0.5">Stay updated with your notifications</p>
                  </div>
                  <button (click)="closeNotificationDropdown()" class="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-200 rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <!-- Notifications List -->
                <div class="max-h-[500px] overflow-y-auto">
                  @if (notificationsToDisplay().length > 0 || chatService.threads().length > 0) {
                    <!-- Notifications Section -->
                    @if (notificationsToDisplay().length > 0) {
                      <div>
                        <div class="px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-700 uppercase tracking-wide">📢 Notifications</div>
                        @for (notification of notificationsToDisplay(); track notification.id) {
                          <button 
                            (click)="onNotificationClick(notification)"
                            class="w-full px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition text-left group relative"
                            [class.bg-blue-50]="!notification.isRead">
                            <div class="flex items-start gap-3">
                              @if (!notification.isRead) {
                                <div class="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse"></div>
                              } @else {
                                <div class="w-2.5 h-2.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                              }
                              <div class="flex-1 min-w-0">
                                <p class="font-semibold text-sm text-gray-900 truncate">{{ notification.title }}</p>
                                <p class="text-sm text-gray-600 line-clamp-2 mt-1">{{ notification.message }}</p>
                                <p class="text-xs text-gray-500 mt-2 font-medium">{{ getRelativeTime(notification.createdAt) }}</p>
                              </div>
                            </div>
                          </button>
                        }
                      </div>
                    }
                    
                    <!-- Chat Messages Section -->
                    @if (chatService.threads().length > 0) {
                      <div>
                        @if (notificationsToDisplay().length > 0) {
                          <div class="px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-700 uppercase tracking-wide">💬 Messages</div>
                        }
                        @for (thread of chatService.threads().slice(0, 3); track thread.id) {
                          <button 
                            (click)="navigateToChat(thread)"
                            class="w-full px-5 py-4 border-b border-gray-100 hover:bg-red-50 transition text-left group relative"
                            [class.bg-red-50]="(thread.unreadCount ?? 0) > 0">
                            <div class="flex items-start gap-3">
                              @if ((thread.unreadCount ?? 0) > 0) {
                                <div class="w-2.5 h-2.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse"></div>
                              } @else {
                                <div class="w-2.5 h-2.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                              }
                              <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between gap-2">
                                  <p class="font-semibold text-sm text-gray-900 truncate">{{ thread.otherUserName }}</p>
                                  @if ((thread.unreadCount ?? 0) > 0) {
                                    <span class="inline-flex items-center justify-center px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold flex-shrink-0">{{ (thread.unreadCount ?? 0) > 99 ? '99+' : thread.unreadCount }}</span>
                                  }
                                </div>
                                <p class="text-sm text-gray-600 line-clamp-2 mt-1">{{ thread.lastMessage }}</p>
                                <p class="text-xs text-gray-500 mt-2 font-medium">{{ getRelativeTime(thread.lastMessageAt) }}</p>
                              </div>
                            </div>
                          </button>
                        }
                      </div>
                    }
                  } @else {
                    <div class="px-6 py-12 text-center">
                      <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                      </div>
                      <p class="text-gray-600 font-semibold text-sm">No notifications yet</p>
                      <p class="text-gray-500 text-xs mt-1">Check back later for updates</p>
                    </div>
                  }
                </div>

                <!-- Dropdown Footer -->
                <div class="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-slate-100">
                  <button 
                    (click)="goToNotifications(); closeNotificationDropdown()"
                    class="w-full text-center text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 transition rounded-lg py-2.5 shadow-sm">
                    View All Notifications →
                  </button>
                </div>
              </div>
            }
            </div>

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
  protected notificationService = inject(NotificationService);
  protected chatService = inject(ChatService);
  private destroyRef = inject(DestroyRef);

  currentUser = this.authService.currentUser;
  
  // Notifications list
  notificationsToDisplay = computed(() => this.notificationService.notificationsList() || []);
  
  // Computed: Combine notification count and chat unread count
  unreadNotificationCount = computed(() => {
    const notificationCount = this.notificationService.unreadCount();
    const chatUnreadCount = this.chatService.unreadCount();
    const totalCount = notificationCount + chatUnreadCount;
    console.log(`📊 Unread: Notifications=${notificationCount}, Chat=${chatUnreadCount}, Total=${totalCount}`);
    return totalCount;
  });
  
  showMobileMenu = signal(false);
  showDesktopDropdown = signal(false);
  showMobileDropdown = signal(false);
  showNotificationDropdown = signal(false);
  
  // Audio notification - using Web Audio API or simple notification sound
  private notificationAudio: HTMLAudioElement | null = null;
  private previousUnreadCount = 0;

  // Effect to trigger notification sound when unread count increases
  private notificationEffect = effect(() => {
    const currentCount = this.unreadNotificationCount();
    console.log(`📊 Notification count changed: ${this.previousUnreadCount} → ${currentCount}`);
    
    // Play sound if count increased and we're not on initial load
    if (currentCount > this.previousUnreadCount && this.previousUnreadCount >= 0) {
      const newNotificationsCount = currentCount - this.previousUnreadCount;
      console.log(`🔔 New notifications detected! +${newNotificationsCount} unread`);
      // Small delay to ensure audio context is ready
      setTimeout(() => {
        this.playNotificationSound();
      }, 100);
    }
    this.previousUnreadCount = currentCount;
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Close notification dropdown if clicking outside of it
    if (!target.closest('button[aria-label="notifications"]') && !target.closest('.notification-dropdown')) {
      if (this.showNotificationDropdown()) {
        this.closeNotificationDropdown();
      }
    }
  }

  ngOnInit() {
    // Initialize notification sound
    this.initializeNotificationSound();
    
    // Initialize notification real-time connection
    this.notificationService.connectToNotifications().catch(error => {
      console.error('Failed to initialize notifications:', error);
    });

    // Initialize chat real-time connection (so messages trigger unread count updates)
    this.chatService.connectToChat().catch(error => {
      console.error('Failed to initialize chat:', error);
    });

    // Load initial unread count immediately
    this.notificationService.getUnreadCount().subscribe();
    
    // Load initial chat threads immediately (this includes unread counts)
    this.chatService.loadThreads().subscribe({
      next: () => {
        console.log('✅ Initial chat threads loaded');
      },
      error: (error) => {
        console.error('Failed to load initial chat threads:', error);
      }
    });
    
    // IMPORTANT: Start aggressive polling immediately
    // This ensures unread badges update within 2 seconds even if SignalR hasn't connected yet
    let initialPollingInterval = setInterval(() => {
      this.chatService.loadThreads().subscribe({
        next: () => {
          console.log('📊 Fast polling (2s): Unread count:', this.chatService.unreadCount());
        },
        error: (error) => {
          console.warn('Fast polling error:', error);
        }
      });
    }, 2000);

    // After 30 seconds, switch to slower polling (5s) to save bandwidth
    setTimeout(() => {
      clearInterval(initialPollingInterval);
      console.log('📊 Switching to standard 5-second polling');
      
      const standardPollingInterval = setInterval(() => {
        this.chatService.loadThreads().subscribe({
          next: () => {
            console.log('📊 Standard polling (5s): Unread count:', this.chatService.unreadCount());
          },
          error: (error) => {
            console.warn('Standard polling error:', error);
          }
        });
      }, 5000);
      
      // Clean up standard polling on component destroy
      this.destroyRef.onDestroy(() => {
        clearInterval(standardPollingInterval);
      });
    }, 30000);

    // Clean up initial polling on component destroy
    this.destroyRef.onDestroy(() => {
      clearInterval(initialPollingInterval);
    });
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

  goToNotifications() {
    this.router.navigate(['/chat']);
  }

  toggleNotificationDropdown() {
    this.showNotificationDropdown.update(val => !val);
    
    // Load notifications when dropdown is opened
    if (this.showNotificationDropdown()) {
      this.notificationService.getNotificationsForDropdown(5);
      // Also load chat threads so we can show recent messages in the dropdown
      this.chatService.loadThreads().subscribe({
        next: () => {
          console.log('✅ Chat threads loaded for dropdown');
        },
        error: (error) => {
          console.error('Failed to load chat threads:', error);
        }
      });
    }
  }

  onNotificationClick(notification: any) {
    // Mark as read on the server
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        console.log('✅ Notification marked as read:', notification.id);
        // Decrement unread count locally
        this.notificationService.decrementUnreadCount();
      },
      error: (error) => {
        console.error('Failed to mark notification as read:', error);
      }
    });
    
    // Close the dropdown
    this.closeNotificationDropdown();
    
    // Reload notifications to refresh the list
    this.notificationService.getNotificationsForDropdown(5);
    
    // Optional: Navigate based on notification type
    if (notification.relatedEntityType === 'Chat' || notification.type === 1) {
      this.router.navigate(['/chat']);
    } else if (notification.relatedEntityType === 'Program' || notification.type === 7) {
      this.router.navigate(['/subscriptions']);
    }
  }

  getRelativeTime(date: Date | string | undefined): string {
    if (!date) return 'Just now';
    
    const notificationDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return notificationDate.toLocaleDateString();
  }

  closeNotificationDropdown() {
    this.showNotificationDropdown.set(false);
  }

  navigateToChat(thread: any) {
    // Close the dropdown
    this.closeNotificationDropdown();
    // Navigate to chat
    this.router.navigate(['/chat']);
  }

  /**
   * Initialize notification sound using Web Audio API
   * Creates a simple beep sound programmatically
   */
  private initializeNotificationSound(): void {
    try {
      // Try to create audio context for playing sounds
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      let audioContext: any = null;
      
      const playNotificationSound = () => {
        try {
          // Create audio context if not already created
          if (!audioContext) {
            audioContext = new AudioContextClass();
          }
          
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }
          
          const now = audioContext.currentTime;
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Create a pleasant notification sound (two-tone)
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.frequency.setValueAtTime(1200, now + 0.1);
          
          gainNode.gain.setValueAtTime(0.3, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          
          console.log('🔊 Notification sound played successfully');
        } catch (error) {
          console.log('Audio context error:', error);
        }
      };
      
      (window as any).playNotificationSound = playNotificationSound;
      console.log('✅ Notification sound initialized');
    } catch (error) {
      console.log('Web Audio API not available, notification sound disabled');
    }
  }

  /**
   * Play notification sound when new notification arrives
   */
  private playNotificationSound(): void {
    try {
      if ((window as any).playNotificationSound) {
        (window as any).playNotificationSound();
      }
      console.log('🔊 Notification sound played');
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }

  /**
   * Override the unreadNotificationCount effect to trigger sound on new notifications
   */
}
