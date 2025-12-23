import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutLogService } from '../services/workout-log.service';
import { BodyStateLog, WorkoutLog } from '../../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-2">Welcome back! Here's your fitness overview.</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">Active Subscriptions</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.activeSubscriptions }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">Workouts This Week</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.workoutsThisWeek }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">Current Weight</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ lastBodyLog?.weightKg || '--' }} kg</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10a7 7 0 1114 0 7 7 0 01-14 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">Streak Days</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.streakDays }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657L13.414 22.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 card">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Workouts</h2>
          <div class="space-y-4">
            <p class="text-gray-500 text-center py-8">No recent workouts yet.</p>
          </div>
        </div>

        <div class="card">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button class="w-full btn-primary text-left pl-4">
              Log Workout
            </button>
            <button class="w-full btn-secondary text-left pl-4">
              Update Weight
            </button>
            <button class="w-full btn-outline text-left pl-4">
              Browse Programs
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  lastBodyLog: BodyStateLog | null = null;
  stats = {
    activeSubscriptions: 0,
    workoutsThisWeek: 0,
    streakDays: 0
  };

  constructor(private workoutLogService: WorkoutLogService) {}

  ngOnInit() {
    this.workoutLogService.getLastStateLog().subscribe({
      next: (log) => {
        this.lastBodyLog = log;
      },
      error: () => {
        // Handle error silently
      }
    });
  }
}
