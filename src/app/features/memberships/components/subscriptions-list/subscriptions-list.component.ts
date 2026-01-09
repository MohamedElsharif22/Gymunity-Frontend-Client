import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionResponse, SubscriptionStatus } from '../../../../core/models';

@Component({
  selector: 'app-subscriptions-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">My Subscriptions</h1>
        <p class="text-gray-600">Manage your active and past subscriptions</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex items-center justify-center py-16">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <h3 class="text-red-900 font-semibold mb-2">Error Loading Subscriptions</h3>
          <p class="text-red-700 text-sm mb-4">{{ error() }}</p>
          <button 
            (click)="loadSubscriptions()" 
            class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            Try Again
          </button>
        </div>
      } @else if (subscriptions().length === 0) {
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"></path>
          </svg>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No Active Subscriptions</h3>
          <p class="text-gray-600 mb-6">You don't have any active subscriptions yet</p>
          <a routerLink="/packages" class="inline-block bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg">
            Browse Packages
          </a>
        </div>
      } @else {
        <!-- Status Filters -->
        <div class="flex flex-wrap gap-3 mb-8">
          <button 
            (click)="filterStatus.set(null)" 
            [class.active]="!filterStatus()"
            class="px-4 py-2 rounded-lg font-semibold transition"
            [class]="!filterStatus() ? 'bg-sky-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'">
            All ({{ subscriptions().length }})
          </button>
          <button 
            (click)="filterStatus.set('Active')" 
            [class.active]="filterStatus() === 'Active'"
            class="px-4 py-2 rounded-lg font-semibold transition"
            [class]="filterStatus() === 'Active' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'">
            Active ({{ activeCount() }})
          </button>
          <button 
            (click)="filterStatus.set('Unpaid')" 
            [class.active]="filterStatus() === 'Unpaid'"
            class="px-4 py-2 rounded-lg font-semibold transition"
            [class]="filterStatus() === 'Unpaid' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'">
            Unpaid ({{ unpaidCount() }})
          </button>
          <button 
            (click)="filterStatus.set('Canceled')" 
            [class.active]="filterStatus() === 'Canceled'"
            class="px-4 py-2 rounded-lg font-semibold transition"
            [class]="filterStatus() === 'Canceled' ? 'bg-gray-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'">
            Canceled ({{ canceledCount() }})
          </button>
        </div>

        <!-- Subscriptions Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (subscription of filteredSubscriptions(); track subscription.id) {
            <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border border-gray-200">
              <!-- Header with Status Badge -->
              <div class="bg-gradient-to-r from-sky-500 to-indigo-600 p-6 text-white relative">
                <h3 class="text-xl font-bold mb-2">{{ subscription.packageName || 'Package' }}</h3>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold">{{ subscription.trainerName || 'Trainer' }}</span>
                  <span [class]="getStatusBadgeClass(subscription.status)" class="px-3 py-1 rounded-full text-xs font-bold">
                    {{ subscription.status }}
                  </span>
                </div>
              </div>

              <!-- Content -->
              <div class="p-6">
                <!-- Pricing -->
                <div class="mb-4 pb-4 border-b border-gray-200">
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-gray-900">{{ subscription.amountPaid }}</span>
                    <span class="text-gray-600 font-semibold">{{ subscription.currency }}</span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">{{ subscription.isAnnual ? 'Annual' : 'Monthly' }} subscription</p>
                </div>

                <!-- Dates -->
                <div class="space-y-2 mb-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Start Date</span>
                    <span class="font-semibold text-gray-900">{{ formatDate(subscription.startDate) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Period End</span>
                    <span class="font-semibold text-gray-900">{{ formatDate(subscription.currentPeriodEnd) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Created</span>
                    <span class="font-semibold text-gray-900">{{ formatDate(subscription.createdAt) }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="space-y-2">
                  @if (subscription.status === 'Unpaid') {
                    <button 
                      (click)="completePayment(subscription.id)"
                      class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition">
                      Complete Payment
                    </button>
                  }
                  @if (subscription.status === 'Active') {
                    <button 
                      (click)="cancelSubscription(subscription.id)"
                      class="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition">
                      Cancel Subscription
                    </button>
                  }
                  @if (subscription.status === 'Canceled' || subscription.status === 'Expired') {
                    <button 
                      (click)="reactivateSubscription(subscription.id)"
                      class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition">
                      Reactivate
                    </button>
                  }
                  <button 
                    (click)="viewDetails(subscription.id)"
                    class="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .active {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class SubscriptionsListComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);

  // Signals
  subscriptions = signal<SubscriptionResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  filterStatus = signal<string | null>(null);

  // Computed values
  filteredSubscriptions = computed(() => {
    const status = this.filterStatus();
    const all = this.subscriptions();
    
    if (!status) return all;
    return all.filter(sub => sub.status === status);
  });

  activeCount = computed(() => {
    return this.subscriptions().filter(s => s.status === SubscriptionStatus.Active).length;
  });

  unpaidCount = computed(() => {
    return this.subscriptions().filter(s => s.status === SubscriptionStatus.Unpaid).length;
  });

  canceledCount = computed(() => {
    return this.subscriptions().filter(s => s.status === SubscriptionStatus.Canceled || s.status === SubscriptionStatus.Cancelled).length;
  });

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.subscriptionService.getClientSubscriptions().subscribe({
      next: (subs) => {
        this.subscriptions.set(subs);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load subscriptions. Please try again later.');
        this.isLoading.set(false);
        console.error('Error loading subscriptions:', err);
      }
    });
  }

  cancelSubscription(subscriptionId: number): void {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      this.subscriptionService.cancelSubscription(subscriptionId).subscribe({
        next: () => {
          this.loadSubscriptions();
        },
        error: (err) => {
          this.error.set('Failed to cancel subscription. Please try again.');
          console.error('Error canceling subscription:', err);
        }
      });
    }
  }

  reactivateSubscription(subscriptionId: number): void {
    this.subscriptionService.reactivateSubscription(subscriptionId).subscribe({
      next: () => {
        this.loadSubscriptions();
      },
      error: (err) => {
        this.error.set('Failed to reactivate subscription. Please try again.');
        console.error('Error reactivating subscription:', err);
      }
    });
  }

  completePayment(subscriptionId: number): void {
    // Navigate to payment component or open payment modal
    console.log('Complete payment for subscription:', subscriptionId);
  }

  viewDetails(subscriptionId: number): void {
    console.log('View details for subscription:', subscriptionId);
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case SubscriptionStatus.Active:
        return 'bg-green-500';
      case SubscriptionStatus.Unpaid:
        return 'bg-yellow-500';
      case SubscriptionStatus.Canceled:
      case SubscriptionStatus.Cancelled:
        return 'bg-red-500';
      case SubscriptionStatus.Expired:
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  }
}
