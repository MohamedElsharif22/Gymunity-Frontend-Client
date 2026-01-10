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
    <div class="min-h-screen bg-white py-12 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header Section -->
        <div class="mb-12 animate-fadeIn">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-5xl font-bold text-gray-900 mb-2">My Subscriptions</h1>
              <p class="text-lg text-gray-600">Manage your active fitness subscriptions</p>
            </div>
            <button (click)="navigateToPackages()" class="hidden md:flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Package
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="!activeSubscription() && isLoading()" class="text-center py-20">
          <div class="inline-block">
            <div class="animate-spin rounded-full h-14 w-14 border-4 border-sky-200 border-t-sky-600 mb-4"></div>
            <p class="text-gray-600 text-lg font-medium">Loading your subscriptions...</p>
          </div>
        </div>

        <!-- No Active Subscription -->
        <div *ngIf="activeSubscriptions().length === 0 && !isLoading()" class="bg-white border border-gray-200 rounded-2xl p-12 text-center mb-6 animate-slideDown shadow-sm">
          <div class="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="text-gray-600 mb-6 text-lg">You don't have an active subscription yet.</p>
          <a routerLink="/packages" class="inline-block bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg">
            Browse Packages
          </a>
        </div>

        <!-- Active Subscriptions List -->
        <div *ngIf="activeSubscriptions().length > 0" class="space-y-8 animate-slideDown">
          <!-- Overview Banner -->
          <div class="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse"></div>
                <div>
                  <p class="text-green-600 font-bold text-xl">🎯 {{ activeSubscriptions().length }} Active {{ activeSubscriptions().length === 1 ? 'Subscription' : 'Subscriptions' }}</p>
                  <p class="text-gray-600 text-sm mt-1">All your premium packages are active and ready to use</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{{ activeSubscriptions().length }}</p>
              </div>
            </div>
          </div>

          <!-- Subscriptions Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <!-- Loop through all subscriptions -->
            <div *ngFor="let subscription of activeSubscriptions(); trackBy: trackBySubscriptionId" class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-200 hover:border-sky-300 transition-all duration-300 flex flex-col">
              <!-- Header with Gradient -->
              <div class="relative overflow-hidden bg-gradient-to-br from-sky-500 to-indigo-600 p-4">
                <div class="relative z-10">
                  <div class="inline-block bg-green-500 px-2 py-0.5 rounded-full mb-2">
                    <p class="text-white text-xs font-bold tracking-wide">✓ ACTIVE</p>
                  </div>
                  <h2 class="text-lg font-bold text-white mb-1 line-clamp-1">{{ subscription.packageName }}</h2>
                  <p class="text-sky-100 text-xs leading-tight line-clamp-1">{{ subscription.packageDescription }}</p>
                </div>
              </div>

              <!-- Content Section -->
              <div class="p-4 space-y-4 flex-grow">
                <!-- Trainer & Days -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <p class="text-gray-600 font-semibold">Trainer</p>
                    <p class="text-gray-900 font-bold">{{ subscription.trainerName }}</p>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <p class="text-gray-600 font-semibold">Days Left</p>
                    <p class="text-sky-600 font-bold">{{ subscription.daysRemaining }}d</p>
                  </div>
                </div>

                <!-- Price -->
                <div class="py-2 border-t border-b border-gray-200">
                  <p class="text-gray-600 text-xs font-semibold mb-1">Amount Paid</p>
                  <p class="text-xl font-bold text-gray-900">{{ subscription.currency }} {{ subscription.amountPaid | number:'1.2-2' }}</p>
                </div>

                <!-- Dates -->
                <div class="space-y-2 text-xs">
                  <div class="flex items-center gap-2">
                    <svg class="w-3 h-3 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-gray-600">{{ subscription.startDate | date:'MMM d' }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-3 h-3 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-gray-600">{{ subscription.currentPeriodEnd | date:'MMM d' }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <button
                  (click)="cancelSubscription(subscription.id)"
                  class="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-2 px-3 rounded-lg transition text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <!-- Add More Packages Card -->
          <div class="bg-gradient-to-br from-sky-50 to-indigo-50 border-2 border-dashed border-sky-300 rounded-2xl overflow-hidden flex items-center justify-center p-8 hover:border-sky-400 hover:shadow-lg transition cursor-pointer" (click)="navigateToPackages()">
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg class="w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <h3 class="text-gray-900 font-bold text-lg mb-2">Subscribe to More Packages</h3>
              <p class="text-gray-600 text-sm mb-4">Add additional fitness packages from top trainers</p>
              <span class="inline-block bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition shadow-lg transform hover:-translate-y-0.5">Browse Packages</span>
            </div>
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
  activeSubscriptions = signal<SubscriptionResponse[]>([]);
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
    this.loadActiveSubscriptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadActiveSubscriptions() {
    this.isLoading.set(true);
    this.subscriptionService.getMySubscriptions('Active')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const subscriptions = response.data?.subscriptions || [];
          const activeList = subscriptions.filter((s: any) => s.status === 'Active' || s.status === 'ACTIVE');

          if (activeList && activeList.length > 0) {
            this.activeSubscriptions.set(activeList);
            this.activeSubscription.set(activeList[0]); // Set first as primary
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading subscriptions:', err);
          this.isLoading.set(false);
        }
      });
  }

  cancelSubscription(subscriptionId: number) {
    const subscription = this.activeSubscriptions().find(s => s.id === subscriptionId);
    if (subscription && confirm('Are you sure you want to cancel this subscription?')) {
      this.subscriptionService.cancelSubscription(subscriptionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Subscription cancelled successfully');
            this.loadActiveSubscriptions();
          },
          error: (err) => {
            console.error('Error cancelling subscription:', err);
            alert('Failed to cancel subscription');
          }
        });
    }
  }

  trackBySubscriptionId(index: number, sub: SubscriptionResponse): number {
    return sub.id;
  }

  navigateToPackages() {
    this.router.navigate(['/packages']);
  }}
