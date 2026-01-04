import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TrainerDiscoveryService } from '../trainers/services/trainer-discovery.service';
import { AuthService } from '../../core/services/auth.service';
import { TrainerCard } from '../../core/models';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
                  [routerLink]="['/trainers']"
                  class="bg-white text-sky-600 font-bold py-3 px-8 rounded-lg hover:bg-sky-50 transition transform hover:scale-105 shadow-lg">
                  Explore Trainers
                </button>
                <button
                  [routerLink]="['/programs']"
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
        } @else if (featuredTrainers().length > 0) {
          <!-- Trainers Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            @for (trainer of featuredTrainers(); track trainer.id) {
              <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden">
                <!-- Trainer Image -->
                <div class="relative h-64 bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center overflow-hidden">
                  @if (trainer.profilePhotoUrl) {
                    <img 
                      [ngSrc]="trainer.profilePhotoUrl" 
                      alt="{{ trainer.fullName }}"
                      width="300"
                      height="400"
                      class="w-full h-full object-cover"
                      priority="false"
                    />
                  } @else {
                    <div class="text-6xl">💪</div>
                  }
                  
                  <!-- Badge -->
                  @if (trainer.isVerified) {
                    <div class="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 shadow-lg">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  }
                </div>

                <!-- Content -->
                <div class="p-6">
                  <h3 class="text-xl font-bold text-gray-900 mb-1">{{ trainer.fullName }}</h3>
                  
                  @if (trainer.specializations && trainer.specializations.length > 0) {
                    <p class="text-sky-600 font-semibold text-sm mb-3">{{ trainer.specializations[0] }}</p>
                  }

                  <!-- Rating -->
                  @if (trainer.ratingAverage) {
                    <div class="flex items-center gap-2 mb-4">
                      <div class="flex gap-1">
                        @for (i of [1, 2, 3, 4, 5]; track i) {
                          <svg 
                            [class]="i <= Math.round(trainer.ratingAverage) ? 'text-yellow-400' : 'text-gray-300'"
                            class="w-4 h-4" 
                            fill="currentColor" 
                            viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        }
                      </div>
                      <span class="text-sm text-gray-600">({{ trainer.totalReviews || 0 }})</span>
                    </div>
                  }

                  <!-- Bio -->
                  @if (trainer.bio) {
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ trainer.bio }}</p>
                  }

                  <!-- Experience -->
                  <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    @if (trainer.yearsExperience) {
                      <span>{{ trainer.yearsExperience }} years experience</span>
                    }
                  </div>

                  <!-- View Profile Button -->
                  <button
                    (click)="viewTrainerProfile(trainer)"
                    class="w-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-semibold py-2 px-4 rounded-lg transition">
                    View Profile
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- View All Trainers Link -->
          <div class="text-center">
            @if (isAuthenticated()) {
              <button
                [routerLink]="['/trainers']"
                class="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-sky-700 transition">
                View All Trainers
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </button>
            } @else {
              <button
                (click)="scrollToTrainers()"
                class="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-sky-700 transition">
                View All Trainers
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </button>
            }
          </div>
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <!-- Strength Training -->
          <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden group cursor-pointer">
            <div class="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-6xl group-hover:scale-110 transition transform">
              🏋️
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Strength Training</h3>
              <p class="text-gray-600 mb-4">Build muscle and increase your overall strength with our comprehensive programs</p>
              <button
                [routerLink]="['/programs']"
                class="text-orange-600 font-semibold hover:text-orange-700 transition inline-flex items-center gap-2">
                Explore <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          <!-- Cardio & Endurance -->
          <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden group cursor-pointer">
            <div class="h-48 bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-6xl group-hover:scale-110 transition transform">
              🏃
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Cardio & Endurance</h3>
              <p class="text-gray-600 mb-4">Improve your cardiovascular health and stamina with dynamic cardio workouts</p>
              <button
                [routerLink]="['/programs']"
                class="text-blue-600 font-semibold hover:text-blue-700 transition inline-flex items-center gap-2">
                Explore <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          <!-- Flexibility & Yoga -->
          <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden group cursor-pointer">
            <div class="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-6xl group-hover:scale-110 transition transform">
              🧘
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Flexibility & Yoga</h3>
              <p class="text-gray-600 mb-4">Enhance flexibility, balance, and mental wellness through yoga and stretching</p>
              <button
                [routerLink]="['/programs']"
                class="text-purple-600 font-semibold hover:text-purple-700 transition inline-flex items-center gap-2">
                Explore <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="text-center">
          <button
            [routerLink]="['/programs']"
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
            [routerLink]="['/trainers']"
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
  private trainerDiscoveryService = inject(TrainerDiscoveryService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated = signal(false);
  featuredTrainers = signal<TrainerCard[]>([]);
  isLoadingTrainers = signal(true);
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
    // Always load trainers, regardless of authentication status
    this.loadFeaturedTrainers();
  }

  loadFeaturedTrainers() {
    this.isLoadingTrainers.set(true);
    this.trainerDiscoveryService.searchTrainers({ 
      pageSize: 6,
      isVerified: true,
      sortBy: 'rating'
    })
      .subscribe({
        next: (response) => {
          // Take top 6 trainers
          const trainers = response.items || [];
          this.featuredTrainers.set(trainers.slice(0, 6));
          this.isLoadingTrainers.set(false);
        },
        error: (error) => {
          console.log('Trainers not available at the moment. If unauthenticated, please sign in to see trainers.');
          // For unauthenticated users or when API fails, show demo trainers
          if (!this.isAuthenticated()) {
            this.loadDemoTrainers();
          }
          this.isLoadingTrainers.set(false);
        }
      });
  }

  loadDemoTrainers() {
    // Demo trainers for unauthenticated users
    const demoTrainers: TrainerCard[] = [
      {
        id: '1',
        fullName: 'Alex Johnson',
        handle: 'alexjohnson',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1567721913486-5f3c4dd8357f?w=400&h=400&fit=crop',
        coverImageUrl: null,
        bio: 'Certified fitness coach with 8 years of experience in strength training',
        isVerified: true,
        ratingAverage: 4.8,
        totalReviews: 142,
        totalClients: 95,
        yearsExperience: 8,
        specializations: ['Strength Training', 'Weight Loss'],
        startingPrice: 50,
        currency: 'USD',
        hasActiveSubscription: false
      },
      {
        id: '2',
        fullName: 'Maria Garcia',
        handle: 'mariagarcia',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=400&h=400&fit=crop',
        coverImageUrl: null,
        bio: 'Yoga and flexibility specialist helping clients achieve balance and wellness',
        isVerified: true,
        ratingAverage: 4.9,
        totalReviews: 187,
        totalClients: 120,
        yearsExperience: 10,
        specializations: ['Yoga', 'Flexibility'],
        startingPrice: 45,
        currency: 'USD',
        hasActiveSubscription: false
      },
      {
        id: '3',
        fullName: 'David Chen',
        handle: 'davidchen',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1574156519202-18a6cacfe814?w=400&h=400&fit=crop',
        coverImageUrl: null,
        bio: 'Marathon coach and cardio expert with proven track record',
        isVerified: true,
        ratingAverage: 4.7,
        totalReviews: 156,
        totalClients: 110,
        yearsExperience: 9,
        specializations: ['Cardio', 'Endurance'],
        startingPrice: 55,
        currency: 'USD',
        hasActiveSubscription: false
      },
      {
        id: '4',
        fullName: 'Sarah Williams',
        handle: 'sarahwilliams',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1517836357463-d25ddfcb3ef7?w=400&h=400&fit=crop',
        coverImageUrl: null,
        bio: 'Personal trainer specializing in functional fitness and HIIT training',
        isVerified: true,
        ratingAverage: 4.8,
        totalReviews: 128,
        totalClients: 85,
        yearsExperience: 7,
        specializations: ['HIIT', 'Functional Fitness'],
        startingPrice: 60,
        currency: 'USD',
        hasActiveSubscription: false
      },
      {
        id: '5',
        fullName: 'James Wilson',
        handle: 'jameswilson',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1570829034853-aae4b8ff8f13?w=400&h=400&fit=crop',
        coverImageUrl: null,
        bio: 'Nutritionist and fitness coach combining diet and exercise for optimal results',
        isVerified: true,
        ratingAverage: 4.9,
        totalReviews: 203,
        totalClients: 150,
        yearsExperience: 12,
        specializations: ['Nutrition', 'Weight Management'],
        startingPrice: 65,
        currency: 'USD',
        hasActiveSubscription: false
      },
      {
        id: '6',
        fullName: 'Emma Thompson',
        handle: 'emmathompson',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
        coverImageUrl: null,
        bio: 'Pilates and core strength specialist for all fitness levels',
        isVerified: true,
        ratingAverage: 4.6,
        totalReviews: 119,
        totalClients: 92,
        yearsExperience: 6,
        specializations: ['Pilates', 'Core Strength'],
        startingPrice: 50,
        currency: 'USD',
        hasActiveSubscription: false
      }
    ];
    this.featuredTrainers.set(demoTrainers);
  }

  viewTrainerProfile(trainer: TrainerCard) {
    this.router.navigate(['/trainers', trainer.id], { 
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
}
