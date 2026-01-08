import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardData } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div class="max-w-7xl mx-auto p-4 md:p-8">
        <!-- Header Section -->
        <div class="mb-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p class="text-gray-600 mt-2 text-lg">Track your fitness journey and celebrate your progress</p>
            </div>
            <button
              (click)="loadDashboard()"
              [disabled]="isLoading()"
              class="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm transition disabled:opacity-50">
              <svg class="w-5 h-5" [class.animate-spin]="isLoading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span class="font-medium">Refresh</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-20">
            <div class="relative">
              <div class="w-20 h-20 border-4 border-sky-200 rounded-full"></div>
              <div class="w-20 h-20 border-4 border-sky-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p class="text-gray-600 mt-6 text-lg font-medium">Loading your fitness data...</p>
          </div>
        }

        <!-- Error State -->
        @else if (error()) {
          <div class="bg-white border-l-4 border-red-500 rounded-xl shadow-lg p-6 mb-8">
            <div class="flex items-start gap-4">
              <div class="bg-red-100 rounded-full p-3">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-red-900">Unable to Load Dashboard</h3>
                <p class="text-red-700 mt-1">{{ error() }}</p>
                <button
                  (click)="loadDashboard()"
                  class="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-sm">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Dashboard Content -->
        @else if (dashboardData()) {
          <!-- Onboarding Alert (if incomplete) -->
          @if (!isOnboardingComplete()) {
            <div class="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-xl p-6 mb-8 text-white">
              <div class="flex items-start gap-4">
                <div class="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold mb-1">Complete Your Profile Setup</h3>
                  <p class="text-white/90 mb-4">Unlock personalized recommendations and track your progress more effectively.</p>
                  <a routerLink="/onboarding"
                     class="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition shadow-lg">
                    Continue Setup
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          }

          <!-- Stats Overview Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <!-- Active Subscriptions Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div class="flex items-start justify-between mb-4">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                  </svg>
                </div>
                <span class="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">Active</span>
              </div>
              <h3 class="text-gray-500 text-sm font-medium mb-1">Subscriptions</h3>
              <p class="text-4xl font-bold text-gray-900">{{ activeSubscriptionCount() }}</p>
            </div>

            <!-- Total Workouts Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div class="flex items-start justify-between mb-4">
                <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <span class="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Total</span>
              </div>
              <h3 class="text-gray-500 text-sm font-medium mb-1">Workouts Logged</h3>
              <p class="text-4xl font-bold text-gray-900">{{ totalWorkouts() }}</p>
            </div>

            <!-- Current Weight Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div class="flex items-start justify-between mb-4">
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                  </svg>
                </div>
                @if (currentWeight()) {
                  <span class="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">Latest</span>
                }
              </div>
              <h3 class="text-gray-500 text-sm font-medium mb-1">Current Weight</h3>
              <p class="text-4xl font-bold text-gray-900">
                @if (currentWeight()) {
                  {{ currentWeight() }}<span class="text-2xl ml-1 text-gray-600">kg</span>
                } @else {
                  <span class="text-gray-400">--</span>
                }
              </p>
            </div>

            <!-- Completion Rate Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div class="flex items-start justify-between mb-4">
                <div class="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-3 shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span class="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">Rate</span>
              </div>
              <h3 class="text-gray-500 text-sm font-medium mb-1">Completion Rate</h3>
              <p class="text-4xl font-bold text-gray-900">{{ completionRate() }}<span class="text-2xl text-gray-600">%</span></p>
            </div>

            <!-- Current Streak Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div class="flex items-start justify-between mb-4">
                <div class="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-3 shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.1 0-2.2 1.2-4.6 6-9.1 4.8 4.5 6 6.9 6 9.1 0 3.53-2.65 6.1-6 6.1z"></path>
                  </svg>
                </div>
                <span class="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">Streak</span>
              </div>
              <h3 class="text-gray-500 text-sm font-medium mb-1">Streak Days</h3>
              <p class="text-4xl font-bold text-gray-900">{{ currentStreak() }}<span class="text-2xl text-gray-600"> 🔥</span></p>
            </div>
          </div>

          <!-- Main Content: Two Column Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Left Column: Recent Workouts (2/3 width) -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Start Exercise Section -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="bg-sky-100 rounded-lg p-2">
                      <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Start Exercise</h2>
                  </div>
                  <a routerLink="/packages"
                     class="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium transition group">
                    View the Packages
                    <svg class="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </a>
                </div>

                <div class="space-y-4">
                  <div class="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-6 border-2 border-sky-200">
                    <p class="text-gray-700 mb-4 text-center font-medium">
                      Ready to start your workout? Select a program and begin your exercise session.
                    </p>
                    <div class="flex gap-3 justify-center">
                      <a routerLink="/discover-programs"
                         class="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-4 rounded-lg font-semibold transition shadow-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        View All Programs
                      </a>
                    </div>
                  </div>

                  @if (activePrograms().length > 0) {
                    <div class="space-y-3">
                      <p class="text-sm font-semibold text-gray-700 px-2">Your Active Programs:</p>
                      @for (program of activePrograms().slice(0, 3); track program.id) {
                        <a [routerLink]="['/programs', program.id]"
                           class="group block border-2 border-gray-100 hover:border-sky-300 rounded-lg p-4 hover:bg-sky-50/50 transition">
                          <div class="flex justify-between items-start">
                            <div class="flex-1">
                              <p class="font-bold text-gray-900 group-hover:text-sky-600 transition">{{ program.title }}</p>
                              <p class="text-sm text-gray-600">{{ program.trainerUserName || 'Professional Trainer' }}</p>
                              <p class="text-xs text-gray-500 mt-1">{{ program.durationWeeks }} weeks • {{ program.type }}</p>
                            </div>
                            <svg class="w-5 h-5 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                            </svg>
                          </div>
                        </a>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Right Column: Quick Actions (1/3 width) -->
            <div class="space-y-6">
              <!-- Quick Actions Card -->
              <div class="bg-gradient-to-br from-sky-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
                <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Quick Actions
                </h2>
                <div class="space-y-3">
                  <a routerLink="/my-active-programs"
                     class="w-full bg-white hover:bg-gray-50 text-sky-600 font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition shadow-lg group">
                    <span class="text-2xl">🎯</span>
                    <span>Start Exercise</span>
                    <svg class="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </a>
                  <a routerLink="/body-state/add"
                     class="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition group">
                    <span class="text-2xl">⚖️</span>
                    <span>Update My Bodystate</span>
                    <svg class="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </a>
                  <a routerLink="/subscriptions"
                     class="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition group">
                    <span class="text-2xl">🎫</span>
                    <span>My Subscriptions</span>
                    <svg class="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </a>
                </div>
              </div>

              <!-- Stats Summary Card -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  Your Progress
                </h3>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Active Programs</span>
                    <span class="font-bold text-gray-900">{{ activePrograms().length }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Recent Workouts</span>
                    <span class="font-bold text-gray-900">{{ recentWorkouts().length }}</span>
                  </div>
                  <div class="h-px bg-gray-200"></div>
                  <div class="pt-2">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span class="text-sm font-bold text-sky-600">{{ completionRate() }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div class="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                           [style.width.%]="completionRate()"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Programs Section -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="bg-indigo-100 rounded-lg p-2">
                  <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Active Programs</h2>
              </div>
              <a routerLink="/discover-programs"
                 class="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition group">
                Browse All
                <svg class="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @if (activePrograms().length > 0) {
                @for (program of activePrograms(); track program.id) {
                  <div class="group border-2 border-gray-100 hover:border-indigo-300 rounded-xl overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer bg-white"
                       [routerLink]="['/programs', program.id]">
                    <!-- Program Image -->
                    @if (program.thumbnailUrl) {
                      <div class="relative h-48 overflow-hidden">
                        <img [src]="program.thumbnailUrl"
                             [alt]="program.title"
                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="absolute bottom-3 left-3 right-3">
                          <p class="text-white font-bold text-lg truncate">{{ program.title }}</p>
                          <p class="text-white/90 text-sm">{{ program.trainerUserName || 'Professional Trainer' }}</p>
                        </div>
                      </div>
                    } @else {
                      <div class="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                        <div class="absolute inset-0 opacity-10">
                          <div class="absolute inset-0" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px);"></div>
                        </div>
                        <svg class="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                        <div class="absolute bottom-3 left-3 right-3">
                          <p class="text-white font-bold text-lg truncate">{{ program.title }}</p>
                          <p class="text-white/90 text-sm">{{ program.trainerUserName || 'Professional Trainer' }}</p>
                        </div>
                      </div>
                    }

                    <!-- Program Content -->
                    <div class="p-5">
                      <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ program.description }}</p>

                      <!-- Program Meta -->
                      <div class="grid grid-cols-2 gap-3 mb-4">
                        <div class="bg-gray-50 rounded-lg p-3">
                          <div class="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Duration
                          </div>
                          <p class="font-bold text-gray-900">{{ program.durationWeeks }}w</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                          <div class="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                            Type
                          </div>
                          <p class="font-bold text-gray-900 capitalize truncate">{{ program.type }}</p>
                        </div>
                      </div>

                      <!-- View Button -->
                      <button class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg">
                        View Program
                        <svg class="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              } @else {
                <div class="col-span-full">
                  <div class="text-center py-20 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl">
                    <div class="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                    </div>
                    <p class="text-gray-600 text-xl font-medium mb-6">No active programs yet</p>
                    <a routerLink="/programs"
                       class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-bold transition shadow-xl">
                      Discover Programs
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host ::ng-deep {
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }

      .animate-slideDown {
        animation: slideDown 0.5s ease-out forwards;
        opacity: 0;
      }

      .animate-slideUp {
        animation: slideUp 0.5s ease-out forwards;
        opacity: 0;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  // State signals
  dashboardData = signal<DashboardData | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Computed values for cleaner template access
  activeSubscriptionCount = computed(() =>
    this.dashboardData()?.dashboard?.summary?.activeSubscriptionCount || 0
  );

  totalWorkouts = computed(() =>
    this.dashboardData()?.dashboard?.summary?.totalWorkouts || 0
  );

  currentWeight = computed(() =>
    this.dashboardData()?.lastBodyLog?.weightKg || null
  );

  completionRate = computed(() =>
    this.dashboardData()?.dashboard?.metrics?.workoutCompletionRate || 0
  );

  currentStreak = computed(() =>
    (this.dashboardData()?.dashboard?.metrics as any)?.currentStreak || 0
  );

  recentWorkouts = computed(() =>
    this.dashboardData()?.recentWorkouts || []
  );

  activePrograms = computed(() =>
    this.dashboardData()?.activePrograms || []
  );

  isOnboardingComplete = computed(() =>
    this.dashboardData()?.isOnboardingComplete ?? true
  );

  private dashboardService = inject(DashboardService);

  constructor() {}

  ngOnInit() {
    this.loadDashboard();
  }

  /**
   * Load all dashboard data using the DashboardService
   */
  loadDashboard() {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.loadDashboardDataWithFallback().subscribe({
      next: (data: DashboardData) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('[Dashboard] Error loading dashboard:', err);
        this.error.set('Unable to load dashboard data. Please check your connection and try again.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Format date string to readable format with relative time
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return '--';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays === 0) {
        return 'Today at ' + date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (diffDays === 1) {
        return 'Yesterday at ' + date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch {
      return '--';
    }
  }
}
