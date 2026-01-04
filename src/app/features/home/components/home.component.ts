import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HomeClientService } from '../../trainers/services/home-client.service';
import { Package } from '../../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <!-- Hero Section -->
      <section class="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div class="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
          <div class="absolute -top-40 -right-40 w-80 h-80 bg-sky-500 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full blur-3xl"></div>
        </div>

        <div class="relative z-10 max-w-6xl mx-auto text-center animate-fadeIn">
          <h1 class="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-6">
            Transform Your Fitness
          </h1>
          <p class="text-xl sm:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of fitness enthusiasts using Gymunity to achieve their goals. Premium training packages tailored for you.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              (click)="scrollToPackages()"
              class="group relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 p-1 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/50 active:scale-95">
              <div class="relative bg-slate-900 rounded-[6px] px-8 py-3 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all text-sm font-bold text-white">
                Explore Packages
                <svg class="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </div>
            </button>
            <a
              routerLink="/profession"
              class="group relative overflow-hidden rounded-lg border-2 border-slate-600 hover:border-slate-500 p-1 transition-all duration-300 active:scale-95">
              <div class="relative bg-slate-900 rounded-[6px] px-8 py-3 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all text-sm font-bold text-white">
                Become a Professional
                <svg class="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- Packages Section -->
      <section #packagesSection class="relative py-20 px-4 sm:px-6 lg:px-8">
        <div class="max-w-6xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-16 animate-slideDown">
            <h2 class="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-4">
              Premium Packages
            </h2>
            <p class="text-lg text-slate-300 max-w-2xl mx-auto">
              Choose the perfect training package to start your fitness journey
            </p>
          </div>

          <!-- Loading State -->
          @if (isLoading()) {
            <div class="flex justify-center items-center min-h-96">
              <div class="relative w-12 h-12">
                <div class="absolute inset-0 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <div class="relative w-12 h-12 rounded-full border-2 border-slate-700 border-t-sky-500 border-r-emerald-500 animate-spin"></div>
              </div>
            </div>
          } @else if (packages().length === 0) {
            <div class="text-center py-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <svg class="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <h3 class="mt-4 text-lg font-bold text-white">No packages available</h3>
              <p class="mt-2 text-slate-300">Check back later for amazing training packages!</p>
            </div>
          } @else {
            <!-- Packages Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (pkg of packages(); track pkg.id; let i = $index) {
                <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-sky-500/50 transition-all duration-300 animate-slideDown group" [style]="{'animation-delay': (i * 100) + 'ms'}">
                  <!-- Card Content -->
                  <div class="p-6 h-full flex flex-col">
                    <!-- Header -->
                    <div class="mb-6">
                      <h3 class="text-2xl font-black text-white mb-2">{{ pkg.name }}</h3>
                      <p class="text-slate-300 text-sm leading-relaxed">{{ pkg.description }}</p>
                    </div>

                    <!-- Price -->
                    <div class="mb-6 pb-6 border-b border-white/10">
                      <div class="flex items-baseline gap-1 mb-2">
                        <span class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                          {{ formatPrice(pkg.priceMonthly) }}
                        </span>
                        <span class="text-slate-300">/month</span>
                      </div>
                      @if (pkg.priceYearly) {
                        <p class="text-xs text-slate-400">{{ '$' }}{{ formatNumber(pkg.priceYearly) }} /year</p>
                      }
                    </div>

                    <!-- Details -->
                    <div class="space-y-3 mb-6 flex-grow">
                      @if (pkg.trainerName) {
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="text-slate-300 text-sm"><span class="font-semibold">Trainer:</span> {{ pkg.trainerName }}</span>
                        </div>
                      }

                      @if (pkg.programIds && pkg.programIds.length > 0) {
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="text-slate-300 text-sm"><span class="font-semibold">Programs:</span> {{ pkg.programIds.length }}</span>
                        </div>
                      }

                      @if (pkg.isActive) {
                        <div class="flex items-center gap-2">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                            Active
                          </span>
                        </div>
                      }
                    </div>

                    <!-- Buttons -->
                    <div class="space-y-3">
                      <button
                        (click)="viewPackageDetails(pkg.id)"
                        class="w-full group relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500/20 to-emerald-500/20 border border-sky-500/50 hover:border-sky-400 p-1 transition-all duration-300 active:scale-95">
                        <div class="relative bg-slate-900/50 rounded-[6px] px-4 py-2 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all text-xs sm:text-sm font-bold text-white">
                          View Details
                        </div>
                      </button>
                      @if (pkg.isActive) {
                        <button
                          (click)="subscribeToPackage(pkg.id)"
                          class="w-full group relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 p-1 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/50 active:scale-95">
                          <div class="relative bg-slate-900 rounded-[6px] px-4 py-2 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all text-xs sm:text-sm font-bold text-white">
                            Subscribe Now
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                            </svg>
                          </div>
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Hover Gradient -->
                  <div class="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-emerald-500/0 group-hover:from-sky-500/10 group-hover:to-emerald-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              }
            </div>
          }
        </div>
      </section>

      <!-- Benefits Section -->
      <section class="relative py-20 px-4 sm:px-6 lg:px-8">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16 animate-slideDown">
            <h2 class="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-4">
              Why Choose Gymunity?
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (benefit of benefits; track benefit.id; let i = $index) {
              <div class="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 animate-slideDown group" [style]="{'animation-delay': (i * 100) + 'ms'}">
                <div class="text-3xl mb-4">{{ benefit.icon }}</div>
                <h3 class="text-lg font-bold text-white mb-2">{{ benefit.title }}</h3>
                <p class="text-slate-300 text-sm leading-relaxed">{{ benefit.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>
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

    :host ::ng-deep {
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }

      .animate-slideDown {
        animation: slideDown 0.5s ease-out forwards;
        opacity: 0;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private homeClientService = inject(HomeClientService);
  private router = inject(Router);

  isLoading = signal(false);
  packages = signal<Package[]>([]);
  packagesSection: any;

  benefits = [
    {
      id: 1,
      icon: '💪',
      title: 'Expert Trainers',
      description: 'Learn from certified fitness professionals with years of experience.'
    },
    {
      id: 2,
      icon: '📊',
      title: 'Track Progress',
      description: 'Monitor your workouts, progress, and achievements in real-time.'
    },
    {
      id: 3,
      icon: '🎯',
      title: 'Custom Programs',
      description: 'Personalized training programs tailored to your goals and fitness level.'
    },
    {
      id: 4,
      icon: '📱',
      title: 'Mobile App',
      description: 'Access your workouts and training anywhere, anytime.'
    },
    {
      id: 5,
      icon: '🏆',
      title: 'Community',
      description: 'Join a supportive community of fitness enthusiasts.'
    },
    {
      id: 6,
      icon: '⚡',
      title: 'Premium Support',
      description: 'Get dedicated support from our team whenever you need help.'
    }
  ];

  ngOnInit() {
    this.loadPackages();
  }

  loadPackages() {
    this.isLoading.set(true);
    this.homeClientService.getAllPackages().subscribe({
      next: (response: any) => {
        const packagesList = response.data || [];
        this.packages.set(packagesList);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading packages:', err);
        this.isLoading.set(false);
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  viewPackageDetails(packageId: number) {
    this.router.navigate(['/packages', packageId]);
  }

  subscribeToPackage(packageId: number) {
    this.router.navigate(['/packages', packageId, 'subscribe']);
  }

  scrollToPackages() {
    const element = document.querySelector('[id="packagesSection"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
