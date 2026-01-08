import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HomeClientService, ProgramClientResponse } from '../trainers/services/home-client.service';
import { AuthService } from '../../core/services/auth.service';
import { TrainerCard, Program } from '../../core/models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Professional Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex items-center gap-3 flex-shrink-0 cursor-pointer" (click)="scrollToTop()">
            <div class="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Gymunity</span>
          </div>

          <!-- Desktop Navigation Links -->
          <div class="hidden md:flex items-center gap-8">
            <a [routerLink]="['/discover/trainers']" class="text-gray-700 hover:text-sky-600 font-medium transition">Trainers</a>
            <a [routerLink]="['/discover/programs']" class="text-gray-700 hover:text-sky-600 font-medium transition">Programs</a>
            <a href="#" class="text-gray-700 hover:text-sky-600 font-medium transition">About</a>
            <a href="#" class="text-gray-700 hover:text-sky-600 font-medium transition">Contact</a>
          </div>

          <!-- Desktop Auth Buttons -->
          <div class="hidden md:flex items-center gap-4">
            @if (isAuthenticated()) {
              <button
                [routerLink]="['/dashboard']"
                class="text-sky-600 hover:text-sky-700 font-medium transition">
                Dashboard
              </button>
              <button
                [routerLink]="['/profile']"
                class="text-gray-700 hover:text-sky-600 font-medium transition">
                Profile
              </button>
              <button
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                Logout
              </button>
            } @else {
              <button
                [routerLink]="['/auth/login']"
                class="text-sky-600 hover:text-sky-700 font-medium transition">
                Sign In
              </button>
              <button
                [routerLink]="['/auth/register']"
                class="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                Get Started
              </button>
            }
          </div>

          <!-- Mobile Menu Button -->
          <button
            (click)="toggleMobileMenu()"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            [attr.aria-label]="mobileMenuOpen() ? 'Close menu' : 'Open menu'">
            @if (!mobileMenuOpen()) {
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            } @else {
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            }
          </button>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden bg-white border-t border-gray-200">
            <div class="px-2 pt-2 pb-4 space-y-1">
              <a [routerLink]="['/discover/trainers']" (click)="closeMobileMenu()" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">Trainers</a>
              <a [routerLink]="['/discover/programs']" (click)="closeMobileMenu()" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">Programs</a>
              <a href="#" (click)="closeMobileMenu()" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">About</a>
              <a href="#" (click)="closeMobileMenu()" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">Contact</a>
              <div class="border-t border-gray-200 pt-4 mt-4 space-y-2">
                @if (isAuthenticated()) {
                  <button
                    [routerLink]="['/dashboard']"
                    (click)="closeMobileMenu()"
                    class="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
                    Dashboard
                  </button>
                  <button
                    [routerLink]="['/profile']"
                    (click)="closeMobileMenu()"
                    class="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
                    Profile
                  </button>
                  <button
                    (click)="logout()"
                    class="block w-full text-left px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium">
                    Logout
                  </button>
                } @else {
                  <button
                    [routerLink]="['/auth/login']"
                    (click)="closeMobileMenu()"
                    class="block w-full text-left px-3 py-2 text-sky-600 hover:bg-sky-50 rounded-lg transition font-medium">
                    Sign In
                  </button>
                  <button
                    [routerLink]="['/auth/register']"
                    (click)="closeMobileMenu()"
                    class="block w-full text-left px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition font-medium">
                    Get Started
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </nav>

    <!-- Add padding-top to account for fixed navbar -->
    <div class="pt-16"></div>

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-sky-600 to-sky-800 text-white py-20 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Left Content -->
          <div class="space-y-6 animate-fade-in">
            <div class="inline-block bg-sky-400/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span class="text-sm font-semibold text-sky-100">Your Fitness Journey Starts Here</span>
            </div>
            
            <h1 class="text-5xl lg:text-6xl font-bold leading-tight">
              Transform Your Body,
              <span class="bg-clip-text text-transparent bg-gradient-to-r from-sky-200 to-cyan-200">
                Transform Your Life
              </span>
            </h1>
            
            <p class="text-xl text-sky-100 leading-relaxed">
              Connect with professional trainers and access personalized fitness programs designed specifically for your goals. Join thousands of members achieving extraordinary results.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4 pt-6">
              @if (isAuthenticated()) {
                <button
                  [routerLink]="['/discover/trainers']"
                  class="bg-white text-sky-600 font-bold py-3 px-8 rounded-lg hover:bg-sky-50 transition transform hover:scale-105 shadow-lg">
                  Explore Trainers
                </button>
                <button
                  [routerLink]="['/discover/programs']"
                  class="bg-sky-500/30 border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-sky-500/50 transition">
                  Browse Programs
                </button>
              } @else {
                <button
                  [routerLink]="['/auth/register']"
                  class="bg-white text-sky-600 font-bold py-3 px-8 rounded-lg hover:bg-sky-50 transition transform hover:scale-105 shadow-lg">
                  Get Started
                </button>
                <button
                  [routerLink]="['/auth/login']"
                  class="bg-sky-500/30 border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-sky-500/50 transition">
                  Sign In
                </button>
              }
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-3 gap-8 pt-12">
              <div>
                <p class="text-3xl font-bold text-cyan-200">500+</p>
                <p class="text-sky-100">Expert Trainers</p>
              </div>
              <div>
                <p class="text-3xl font-bold text-cyan-200">1000+</p>
                <p class="text-sky-100">Programs</p>
              </div>
              <div>
                <p class="text-3xl font-bold text-cyan-200">50K+</p>
                <p class="text-sky-100">Active Members</p>
              </div>
            </div>
          </div>
          
          <!-- Right Image -->
          <div class="hidden lg:block">
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-2xl blur-2xl opacity-30"></div>
              <svg class="relative w-full h-auto" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="200" cy="200" r="180" stroke="currentColor" stroke-width="2" class="text-sky-300 opacity-20"/>
                <path d="M200 100C250 100 300 150 300 200C300 250 250 300 200 300C150 300 100 250 100 200C100 150 150 100 200 100Z" 
                      stroke="currentColor" stroke-width="2" class="text-cyan-200 opacity-40" fill="none"/>
                <circle cx="200" cy="200" r="60" fill="currentColor" class="text-sky-300 opacity-30"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Trainers Section -->
    <section id="featured-trainers" class="py-20 px-4 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Featured Trainers</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet our certified and experienced trainers dedicated to helping you achieve your fitness goals
          </p>
        </div>

        <!-- Loading State -->
        @if (isLoadingTrainers()) {
          <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-sky-600 border-t-transparent"></div>
          </div>
        } @else if (featuredTrainers().length === 0) {
          <div class="text-center py-16 bg-white rounded-lg shadow">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292m0 0H7.465M4.5 15H21m-16.5-6h16.5"></path>
            </svg>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">No trainers found</h3>
            <p class="text-gray-600">Unable to load trainer information. Please refresh the page.</p>
          </div>
        } @else {
          <!-- Professional Trainers Grid - Enhanced Layout -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            @for (trainer of featuredTrainers(); track trainer.id) {
              <article 
                class="group bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-sky-300 transition-all duration-300 cursor-pointer flex flex-col h-full"
                (click)="viewTrainerProfile(trainer)"
              >
                <!-- Cover Image with Overlay -->
                <div class="relative h-48 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 overflow-hidden">
                  @if (getTrainerPhotoUrl(trainer)) {
                    <img 
                      [src]="getTrainerPhotoUrl(trainer)" 
                      [alt]="trainer.userName || 'Trainer'"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <!-- Dark overlay for better text contrast -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  }
                  
                  <!-- Verified Badge (Top Right) -->
                  @if (trainer.isVerified) {
                    <div class="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg font-semibold text-xs">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      Verified
                    </div>
                  }

                  <!-- Active Badge (Top Left) -->
                  @if (trainer.hasActiveSubscription) {
                    <div class="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      Active
                    </div>
                  }
                </div>

                <!-- Content -->
                <div class="p-6 flex flex-col flex-1">
                  <!-- Avatar & Name (Overlapping cover) -->
                  <div class="flex items-start gap-4 -mt-14 mb-4">
                    <div class="relative flex-shrink-0">
                      <div class="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden">
                        @if (getTrainerPhotoUrl(trainer)) {
                          <img 
                            [src]="getTrainerPhotoUrl(trainer)" 
                            [alt]="trainer.userName"
                            class="w-full h-full object-cover"
                          />
                        } @else {
                          <div class="w-full h-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                            {{ trainer.userName.charAt(0).toUpperCase() || 'T' }}
                          </div>
                        }
                      </div>
                      <!-- Online Status Indicator -->
                      <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <!-- Trainer Info -->
                    <div class="flex-1 pt-10">
                      <h3 class="text-lg font-bold text-gray-900 mb-0.5 group-hover:text-sky-600 transition-colors">
                        {{ trainer.userName || 'Trainer' }}
                      </h3>
                      @if (trainer.handle) {
                        <p class="text-xs text-sky-600 font-medium">{{ '@' + trainer.handle }}</p>
                      }
                    </div>
                  </div>

                  <!-- Bio -->
                  @if (trainer.bio) {
                    <p class="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed flex-grow">
                      {{ trainer.bio }}
                    </p>
                  }

                  <!-- Rating & Reviews -->
                  @if (trainer.ratingAverage || trainer.totalReviews) {
                    <div class="flex items-center gap-2 mb-4">
                      <div class="flex items-center gap-0.5">
                        @for (i of [1, 2, 3, 4, 5]; track i) {
                          <svg 
                            [class]="i <= Math.round(trainer.ratingAverage || 0) ? 'text-yellow-400' : 'text-gray-300'"
                            class="w-4 h-4" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        }
                      </div>
                      <span class="text-sm font-semibold text-gray-900">{{ (trainer.ratingAverage || 0).toFixed(1) }}</span>
                      @if (trainer.totalReviews) {
                        <span class="text-xs text-gray-500">({{ trainer.totalReviews }})</span>
                      }
                    </div>
                  }

                  <!-- Stats Grid -->
                  <div class="grid gap-3 py-4 border-t border-b border-gray-200 mb-4" [ngClass]="'grid-cols-' + getVisibleStatsCount(trainer)">
                    @if (trainer.yearsExperience) {
                      <div class="text-center">
                        <p class="text-lg font-bold text-gray-900">{{ trainer.yearsExperience }}</p>
                        <p class="text-xs text-gray-600">Years</p>
                      </div>
                    }
                    @if (trainer.totalClients) {
                      <div class="text-center">
                        <p class="text-lg font-bold text-gray-900">{{ trainer.totalClients }}</p>
                        <p class="text-xs text-gray-600">Clients</p>
                      </div>
                    }
                    @if (trainer.ratingAverage) {
                      <div class="text-center">
                        <p class="text-lg font-bold text-gray-900">{{ (trainer.ratingAverage || 0).toFixed(1) }}</p>
                        <p class="text-xs text-gray-600">Rating</p>
                      </div>
                    }
                  </div>

                  <!-- Price & CTA -->
                  <div class="flex flex-col gap-3 mt-auto">
                    @if (trainer.startingPrice) {
                      <div class="flex flex-col">
                        <span class="text-xs text-gray-500">Starting at</span>
                        <div class="flex items-baseline gap-1">
                          <span class="text-2xl font-bold text-gray-900">\${{ trainer.startingPrice }}</span>
                          <span class="text-sm text-gray-600">/session</span>
                        </div>
                      </div>
                    }
                    
                    <button
                      (click)="viewTrainerProfile(trainer); $event.stopPropagation()"
                      class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
                    >
                      <span>View Profile</span>
                      <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>

          <!-- View All Trainers Button -->
          <div class="flex justify-center pt-8">
            <button
              [routerLink]="['/discover/trainers']"
              class="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <span>View All Trainers</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>

          <style>
            .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          </style>
        }
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="py-20 px-4 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Why Choose Gymunity?</h2>
          <p class="text-lg text-gray-600">Everything you need to succeed in your fitness journey</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Feature 1 -->
          <div class="text-center">
            <div class="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Affordable Pricing</h3>
            <p class="text-gray-600">Flexible payment plans that fit your budget</p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center">
            <div class="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Verified Trainers</h3>
            <p class="text-gray-600">All trainers are certified and experienced professionals</p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center">
            <div class="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Personalized Programs</h3>
            <p class="text-gray-600">Custom fitness plans tailored to your goals</p>
          </div>

          <!-- Feature 4 -->
          <div class="text-center">
            <div class="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">24/7 Support</h3>
            <p class="text-gray-600">Always available to help with your fitness journey</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Programs Showcase Section -->
    <section class="py-20 px-4 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Popular Programs</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover a variety of fitness programs designed for all experience levels and goals
          </p>
        </div>

        <!-- Program Categories -->
        @if (isLoadingPrograms()) {
          <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-sky-600 border-t-transparent"></div>
          </div>
        } @else if (popularPrograms().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            @for (program of popularPrograms(); track program.id) {
              <div 
                (click)="viewProgram(program.id)"
                class="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden group cursor-pointer transform hover:scale-105">
                <div class="h-48 bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-6xl group-hover:scale-110 transition">
                  @if (program.thumbnailUrl) {
                    <img
                      [src]="program.thumbnailUrl"
                      [alt]="program.title || 'Program'"
                      class="w-full h-full object-cover"
                    />
                  } @else {
                    <span>ðŸ’ª</span>
                  }
                </div>
                <div class="p-6">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">{{ program.title || 'Program' }}</h3>
                  <p class="text-gray-600 mb-4 line-clamp-2">{{ program.description || 'Fitness program designed for you' }}</p>
                  
                  <!-- Program Stats -->
                  <div class="flex gap-4 mb-4 text-sm text-gray-600">
                    @if (program.durationWeeks) {
                      <span>â±ï¸ {{ program.durationWeeks }} weeks</span>
                    }
                    @if (program.type) {
                      <span>ðŸŽ¯ {{ program.type }}</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <!-- Strength Training -->
            <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden group cursor-pointer">
              <div class="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-6xl group-hover:scale-110 transition transform">
                ðŸ‹ï¸
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">Strength Training</h3>
                <p class="text-gray-600 mb-4">Build muscle and increase your overall strength with our comprehensive programs</p>
                <button
                  [routerLink]="['/discover/programs']"
                  class="text-orange-600 font-semibold hover:text-orange-700 transition inline-flex items-center gap-2">
                  Explore <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>

            <!-- Cardio & Endurance -->
            <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden group cursor-pointer">
              <div class="h-48 bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-6xl group-hover:scale-110 transition transform">
                ðŸƒ
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">Cardio & Endurance</h3>
                <p class="text-gray-600 mb-4">Improve your cardiovascular health and stamina with dynamic cardio workouts</p>
                <button
                  [routerLink]="['/discover/programs']"
                  class="text-blue-600 font-semibold hover:text-blue-700 transition inline-flex items-center gap-2">
                  Explore <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>

            <!-- Flexibility & Yoga -->
            <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden group cursor-pointer">
              <div class="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-6xl group-hover:scale-110 transition transform">
                ðŸ§˜
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">Flexibility & Yoga</h3>
                <p class="text-gray-600 mb-4">Enhance flexibility, balance, and mental wellness through yoga and stretching</p>
                <button
                  [routerLink]="['/discover/programs']"
                  class="text-purple-600 font-semibold hover:text-purple-700 transition inline-flex items-center gap-2">
                  Explore <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          </div>
        }

        <!-- CTA -->
        <div class="text-center">
          <button
            [routerLink]="['/discover/programs']"
            class="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-sky-700 transition">
            View All Programs
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-20 px-4 bg-sky-50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p class="text-lg text-gray-600">Join thousands of members who've transformed their fitness</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (testimonial of testimonials; track testimonial.id) {
            <div class="bg-white rounded-lg shadow-md p-8">
              <!-- Rating -->
              <div class="flex gap-1 mb-4">
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                }
              </div>

              <!-- Review -->
              <p class="text-gray-600 mb-6 italic">{{ testimonial.text }}</p>

              <!-- Author -->
              <div>
                <p class="font-bold text-gray-900">{{ testimonial.author }}</p>
                <p class="text-sm text-gray-500">{{ testimonial.role }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 bg-gradient-to-r from-sky-600 to-sky-800 text-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-6">Ready to Transform Your Fitness?</h2>
        <p class="text-xl text-sky-100 mb-10">
          Join Gymunity today and connect with expert trainers who are ready to help you achieve your goals.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            [routerLink]="['/auth/register']"
            class="bg-white text-sky-600 font-bold py-3 px-10 rounded-lg hover:bg-sky-50 transition transform hover:scale-105 shadow-lg">
            Get Started
          </button>
          <button
            [routerLink]="['/discover/trainers']"
            class="bg-sky-500/30 border-2 border-white text-white font-bold py-3 px-10 rounded-lg hover:bg-sky-500/50 transition">
            Browse Trainers
          </button>
        </div>
      </div>
    </section>

  `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host ::ng-deep .animate-fade-in {
      animation: fade-in 0.8s ease-out;
    }
  `]
})
export class LandingComponent implements OnInit {
  private homeClientService = inject(HomeClientService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated = signal(false);
  mobileMenuOpen = signal(false);
  featuredTrainers = signal<TrainerCard[]>([]);
  isLoadingTrainers = signal(true);
  popularPrograms = signal<ProgramClientResponse[]>([]);
  isLoadingPrograms = signal(true);
  Math = Math;

  testimonials = [
    {
      id: 1,
      text: "Gymunity transformed my fitness journey! The trainers are incredibly knowledgeable and supportive. I lost 20 pounds in just 3 months!",
      author: "Sarah Johnson",
      role: "Fitness Enthusiast"
    },
    {
      id: 2,
      text: "Finally found a platform that offers quality training programs at reasonable prices. The personalized approach really made the difference.",
      author: "Ahmed Hassan",
      role: "Marathon Runner"
    },
    {
      id: 3,
      text: "Best investment in my health! The community is supportive and the trainers keep you accountable. Highly recommended!",
      author: "Maria Garcia",
      role: "Wellness Coach"
    }
  ];

  ngOnInit() {
    console.log('[LandingComponent] Initializing landing page');
    this.isAuthenticated.set(this.authService.isAuthenticated());
    console.log('[LandingComponent] User authenticated:', this.isAuthenticated());
    // Always load trainers and programs, regardless of authentication status
    this.loadFeaturedTrainers();
    this.loadPopularPrograms();
  }

  loadFeaturedTrainers() {
    this.isLoadingTrainers.set(true);
    this.homeClientService.getAllTrainers()
      .subscribe({
        next: (response) => {
          // Cast trainers to TrainerProfile and get top 6
          const trainers = (response || []) as unknown as TrainerCard[];
          if (trainers.length > 0) {
            this.featuredTrainers.set(trainers.slice(0, 6));
          } else {
            this.loadDemoTrainers();
          }
          this.isLoadingTrainers.set(false);
        },
        error: (error) => {
          console.log('[LandingComponent] Error loading trainers:', error);
          // Show demo trainers on any error (API not available, 403, etc.)
          this.loadDemoTrainers();
          this.isLoadingTrainers.set(false);
        }
      });
  }

  loadDemoTrainers() {
    // Demo trainers for unauthenticated users
    const demoTrainers: TrainerCard[] = [
      {
        id: 1,
        userId: '1',
        userName: 'Alex Johnson',
        handle: 'alexjohnson',
        coverImageUrl: 'https://images.unsplash.com/photo-1567721913486-5f3c4dd8357f?w=400&h=400&fit=crop',
        bio: 'Certified fitness coach with 8 years of experience in strength training',
        isVerified: true,
        ratingAverage: 4.8,
        totalClients: 95,
        yearsExperience: 8,
        totalReviews: 45,
        startingPrice: 50,
        hasActiveSubscription: true
      },
      {
        id: 2,
        userId: '2',
        userName: 'Maria Garcia',
        handle: 'mariagarcia',
        coverImageUrl: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=400&h=400&fit=crop',
        bio: 'Yoga and flexibility specialist helping clients achieve balance and wellness',
        isVerified: true,
        ratingAverage: 4.9,
        totalClients: 120,
        yearsExperience: 10,
        totalReviews: 67,
        startingPrice: 45,
        hasActiveSubscription: true
      },
      {
        id: 3,
        userId: '3',
        userName: 'David Chen',
        handle: 'davidchen',
        coverImageUrl: 'https://images.unsplash.com/photo-1574156519202-18a6cacfe814?w=400&h=400&fit=crop',
        bio: 'Marathon coach and cardio expert with proven track record',
        isVerified: true,
        ratingAverage: 4.7,
        totalClients: 110,
        yearsExperience: 9,
        totalReviews: 52,
        startingPrice: 55,
        hasActiveSubscription: true
      },
      {
        id: 4,
        userId: '4',
        userName: 'Sarah Williams',
        handle: 'sarahwilliams',
        coverImageUrl: 'https://images.unsplash.com/photo-1517836357463-d25ddfcb3ef7?w=400&h=400&fit=crop',
        bio: 'Personal trainer specializing in functional fitness and HIIT training',
        isVerified: true,
        ratingAverage: 4.8,
        totalClients: 85,
        yearsExperience: 7,
        totalReviews: 41,
        startingPrice: 60,
        hasActiveSubscription: true
      },
      {
        id: 5,
        userId: '5',
        userName: 'James Wilson',
        handle: 'jameswilson',
        coverImageUrl: 'https://images.unsplash.com/photo-1570829034853-aae4b8ff8f13?w=400&h=400&fit=crop',
        bio: 'Nutritionist and fitness coach combining diet and exercise for optimal results',
        isVerified: true,
        ratingAverage: 4.9,
        totalClients: 150,
        yearsExperience: 12,
        totalReviews: 78,
        startingPrice: 65,
        hasActiveSubscription: true
      },
      {
        id: 6,
        userId: '6',
        userName: 'Emma Thompson',
        handle: 'emmathompson',
        coverImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
        bio: 'Pilates and core strength specialist for all fitness levels',
        isVerified: false,
        ratingAverage: 4.6,
        totalClients: 92,
        yearsExperience: 6,
        totalReviews: 39,
        startingPrice: 48,
        hasActiveSubscription: true
      }
    ];
    this.featuredTrainers.set(demoTrainers);
  }

  loadPopularPrograms() {
    this.isLoadingPrograms.set(true);
    this.homeClientService.getAllPrograms().subscribe({
      next: (programs) => {
        if (programs && programs.length > 0) {
          // Take top 6 programs and sort by title for consistency
          const sortedPrograms = programs
            .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
            .slice(0, 6);
          this.popularPrograms.set(sortedPrograms);
        } else {
          // No programs returned, show empty state
          this.popularPrograms.set([]);
        }
        this.isLoadingPrograms.set(false);
      },
      error: (error) => {
        console.log('[LandingComponent] Error loading programs:', error);
        // On any error (API not available, 403, etc.), show empty state
        // This will trigger the category fallback cards
        this.popularPrograms.set([]);
        this.isLoadingPrograms.set(false);
      }
    });
  }

  viewProgram(programId: number) {
    this.router.navigate(['/discover/programs', programId]);
  }

  viewTrainerProfile(trainer: TrainerCard) {
    this.router.navigate(['/discover/trainers', trainer.userId], { 
      state: { trainer } 
    });
  }

  scrollToTrainers() {
    // Scroll to trainers section for unauthenticated users
    const element = document.querySelector('[id="featured-trainers"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToTop() {
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getTrainerPhotoUrl(trainer: TrainerCard): string {
    return trainer.coverImageUrl || '';
  }

  getVisibleStatsCount(trainer: TrainerCard): number {
    let count = 0;
    if (trainer.yearsExperience) count++;
    if (trainer.totalClients) count++;
    if (trainer.ratingAverage) count++;
    return Math.max(count, 1); // At least 1 to avoid grid errors
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/auth/login']);
  }
}

