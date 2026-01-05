import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutHistoryService, CompletedWorkout } from '../../services/workout-history.service';

@Component({
  selector: 'app-my-workouts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="my-workouts">
      <div class="header">
        <h1>My Workout History</h1>
        <p class="subtitle">All completed workouts from your local history</p>
      </div>

      @if (workouts().length === 0) {
        <div class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <p class="empty-title">No workouts logged yet</p>
          <p class="empty-description">Start a workout to see your history here.</p>
        </div>
      } @else {
        <div class="stats-summary">
          <div class="stat-card">
            <div class="stat-label">Total Workouts</div>
            <div class="stat-value">{{ totalWorkouts() }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Unique Days</div>
            <div class="stat-value">{{ uniqueProgramDays() }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Duration</div>
            <div class="stat-value">{{ totalDuration() }}h</div>
          </div>
        </div>

        <div class="workouts-list">
          @for (workout of workouts(); track $index) {
            <div class="workout-card">
              <div class="workout-card-header">
                <div>
                  <h3>{{ workout.programDayName }}</h3>
                  <p class="exercises-count">{{ workout.numberOfExercises }} exercises</p>
                </div>
                <span class="badge">{{ workout.durationMinutes }} min</span>
              </div>
              <div class="workout-card-body">
                <p class="date">{{ formatDate(workout.completedAt) }}</p>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .my-workouts {
        padding: 2rem;
        max-width: 900px;
        margin: 0 auto;
        min-height: 100vh;
        background-color: #f9fafb;
      }

      .header {
        margin-bottom: 3rem;
      }

      .header h1 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        color: #1a1a1a;
      }

      .subtitle {
        color: #666;
        margin: 0.5rem 0 0;
        font-size: 0.95rem;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 1rem;
        border: 2px dashed #ddd;
      }

      .empty-icon {
        width: 3rem;
        height: 3rem;
        margin: 0 auto 1rem;
        color: #999;
      }

      .empty-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #333;
        margin: 0;
      }

      .empty-description {
        color: #666;
        margin: 0.5rem 0 0;
        font-size: 0.95rem;
      }

      .stats-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .stat-label {
        font-size: 0.85rem;
        color: #666;
        text-transform: uppercase;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #2196f3;
      }

      .workouts-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .workout-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }

      .workout-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .workout-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .workout-card-header h3 {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
        color: #1a1a1a;
      }

      .exercises-count {
        font-size: 0.85rem;
        color: #999;
        margin: 0.25rem 0 0;
      }

      .badge {
        background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        white-space: nowrap;
      }

      .workout-card-body {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .date {
        font-size: 0.9rem;
        color: #666;
        margin: 0;
      }

      @media (max-width: 640px) {
        .my-workouts {
          padding: 1rem;
        }

        .header h1 {
          font-size: 1.5rem;
        }

        .stats-summary {
          grid-template-columns: 1fr;
        }

        .workout-card {
          padding: 1rem;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyWorkoutsComponent {
  private workoutHistoryService = inject(WorkoutHistoryService);

  // Get read-only signal from the service
  workouts = this.workoutHistoryService.history;

  // Computed stats
  totalWorkouts = computed(() => this.workouts().length);

  uniqueProgramDays = computed(() => {
    const uniqueDays = new Set(this.workouts().map(w => w.programDayId));
    return uniqueDays.size;
  });

  totalDuration = computed(() => {
    const total = this.workouts().reduce((sum, w) => sum + w.durationMinutes, 0);
    return (total / 60).toFixed(1);
  });

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

