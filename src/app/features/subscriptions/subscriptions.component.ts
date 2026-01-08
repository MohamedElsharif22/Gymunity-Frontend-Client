import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SubscriptionService, SubscriptionResponse } from '../packages/services/subscription.service';
import { ProgramService } from '../programs/services/program.service';
import { Program, ProgramWeek, ProgramDay, DayExercise } from '../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header Section -->
        <div class="text-center mb-8 animate-fadeIn">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            My Subscription
          </h1>
          <p class="text-lg text-gray-600">Your premium fitness journey</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="!activeSubscription() && isLoading()" class="text-center py-16">
          <div class="inline-block">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-500"></div>
            <p class="text-gray-600 mt-4 text-base">Loading your subscription...</p>
          </div>
        </div>

        <!-- No Active Subscription -->
        <div *ngIf="!activeSubscription() && !isLoading()" class="bg-white border border-gray-200 rounded-lg p-8 text-center mb-6 animate-slideDown shadow-sm">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-gray-600 mb-6">You don't have an active subscription yet.</p>
          <a routerLink="/packages" class="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            Browse Packages
          </a>
        </div>

        <!-- Active Subscription Card -->
        <div *ngIf="activeSubscription()" class="animate-slideDown">
          <!-- Active Status Banner -->
          <div class="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <p class="text-emerald-900 font-bold text-lg">✓ Your Subscription is Active</p>
                  <p class="text-emerald-700 text-sm">Premium access active · {{ activeSubscription()?.daysRemaining }} days remaining</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-emerald-600 text-xs font-semibold">NEXT BILLING</p>
                <p class="text-emerald-900 font-bold">{{ activeSubscription()?.currentPeriodEnd | date:'MMM d, yyyy' }}</p>
              </div>
            </div>
          </div>

          <!-- Subscriptions Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Main Subscription Card -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <!-- Header -->
              <div class="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 p-4">
                <div class="relative z-10">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <div class="inline-block bg-white/25 px-2 py-1 rounded-full mb-2">
                        <p class="text-white text-xs font-semibold">✓ Active</p>
                      </div>
                      <h2 class="text-xl font-bold text-white mb-1">{{ activeSubscription()?.packageName }}</h2>
                      <p class="text-white/90 text-sm">{{ activeSubscription()?.packageDescription }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-white/80 text-xs font-semibold mb-1">TOTAL PAID</p>
                      <p class="text-lg font-bold text-white">
                        {{ activeSubscription()?.currency }} {{ activeSubscription()?.amountPaid | number:'1.2-2' }}
                      </p>
                    </div>
                  </div>

                  <!-- Key Info Grid -->
                  <div class="grid grid-cols-2 gap-2">
                    <div class="bg-white/15 rounded p-2">
                      <p class="text-white/80 text-xs font-semibold mb-1">Trainer</p>
                      <p class="text-white font-bold text-sm">{{ activeSubscription()?.trainerName }}</p>
                    </div>
                    <div class="bg-white/15 rounded p-2">
                      <p class="text-white/80 text-xs font-semibold mb-1">Start</p>
                      <p class="text-white font-bold text-sm">{{ activeSubscription()?.startDate | date:'MMM dd' }}</p>
                    </div>
                    <div class="bg-white/15 rounded p-2">
                      <p class="text-white/80 text-xs font-semibold mb-1">End</p>
                      <p class="text-white font-bold text-sm">{{ activeSubscription()?.currentPeriodEnd | date:'MMM dd' }}</p>
                    </div>
                    <div class="bg-red-400/30 rounded p-2">
                      <p class="text-red-800 text-xs font-semibold mb-1">Days Left</p>
                      <p class="text-white font-bold text-sm">{{ activeSubscription()?.daysRemaining }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Benefits Section -->
              <div class="p-4 border-t border-gray-200">
                <h3 class="text-base font-bold text-gray-900 mb-3">What's Included</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <!-- Benefit 1 -->
                  <div class="bg-gray-50 border border-gray-200 rounded p-3 hover:bg-gray-100 transition">
                    <div class="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center mb-2">
                      <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <h4 class="text-gray-900 font-bold mb-1 text-sm">Workout Plans</h4>
                    <p class="text-gray-600 text-xs">Personalized programs</p>
                  </div>

                  <!-- Benefit 2 -->
                  <div class="bg-gray-50 border border-gray-200 rounded p-3 hover:bg-gray-100 transition">
                    <div class="w-8 h-8 rounded bg-blue-100 flex items-center justify-center mb-2">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h4 class="text-gray-900 font-bold mb-1 text-sm">Expert Support</h4>
                    <p class="text-gray-600 text-xs">Pro trainers</p>
                  </div>

                  <!-- Benefit 3 -->
                  <div class="bg-gray-50 border border-gray-200 rounded p-3 hover:bg-gray-100 transition">
                    <div class="w-8 h-8 rounded bg-orange-100 flex items-center justify-center mb-2">
                      <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <h4 class="text-gray-900 font-bold mb-1 text-sm">Progress Track</h4>
                    <p class="text-gray-600 text-xs">Analytics</p>
                  </div>
                </div>
              </div>

              <!-- Timeline Info -->
              <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div class="grid grid-cols-2 gap-3">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-gray-600 text-xs">Since</p>
                      <p class="text-gray-900 font-bold text-sm">{{ activeSubscription()?.startDate | date:'MMM d' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded bg-red-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-gray-600 text-xs">Expires</p>
                      <p class="text-gray-900 font-bold text-sm">{{ activeSubscription()?.currentPeriodEnd | date:'MMM d' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add More Packages Card -->
            <div class="bg-white border border-dashed border-gray-300 rounded-lg overflow-hidden shadow-sm flex items-center justify-center p-6 hover:bg-gray-50 transition cursor-pointer" (click)="navigateToPackages()">
              <div class="text-center">
                <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </div>
                <h3 class="text-gray-900 font-bold text-base mb-2">Add More Packages</h3>
                <p class="text-gray-600 text-sm mb-3">Subscribe to additional packages</p>
                <span class="inline-block bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm font-semibold transition">Browse Packages</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 justify-center animate-slideUp flex-wrap" style="animation-delay: 0.2s;">
            <a routerLink="/dashboard"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m2 3l2-3m2 3l2-3m2-4l2 3m-2-3V7m6 0v10m6-10v10m0 0l-2-3m2 3l-2-3"></path>
              </svg>
              Dashboard
            </a>
            <button
              (click)="cancelSubscription()"
              class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Cancel
            </button>
          </div>
        </div>
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
        transform: translateY(-15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    :host ::ng-deep {
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-out;
      }

      .animate-slideDown {
        animation: slideDown 0.5s ease-out forwards;
        opacity: 0;
      }

      .animate-slideUp {
        animation: slideUp 0.5s ease-out forwards;
        opacity: 0;
      }

      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    }
  `]
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  private subscriptionService = inject(SubscriptionService);
  private programService = inject(ProgramService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // State signals
  activeSubscription = signal<SubscriptionResponse | null>(null);
  programWeeks = signal<ProgramWeek[]>([]);
  selectedWeek = signal<ProgramWeek | null>(null);
  expandedDays = signal<number[]>([]);
  isLoading = signal(true);
  showWorkoutDialog = signal(false);
  selectedDay = signal<ProgramDay | null>(null);

  // Computed signals
  selectedDayTotalSets = computed(() => {
    const day = this.selectedDay();
    if (!day || !day.exercises) return 0;
    return day.exercises.reduce((total, exercise) => {
      return total + parseInt(exercise.sets || '0', 10);
    }, 0);
  });

  ngOnInit() {
    this.loadActiveSubscription();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadActiveSubscription() {
    this.isLoading.set(true);
    this.subscriptionService.getMySubscriptions('Active')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const subscriptions = response.data?.subscriptions || [];
          const active = subscriptions.find((s: any) => s.status === 'Active' || s.status === 'ACTIVE');

          if (active) {
            this.activeSubscription.set(active);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading subscription:', err);
          this.isLoading.set(false);
        }
      });
  }

  cancelSubscription() {
    const subscription = this.activeSubscription();
    if (subscription && confirm('Are you sure you want to cancel this subscription?')) {
      this.subscriptionService.cancelSubscription(subscription.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Subscription cancelled successfully');
            this.router.navigate(['/packages']);
          },
          error: (err) => {
            console.error('Error cancelling subscription:', err);
            alert('Failed to cancel subscription');
          }
        });
    }
  }

  navigateToPackages() {
    this.router.navigate(['/packages']);
  }}
