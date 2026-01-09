import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProgramService } from '../../../programs/services/program.service';
import { ExerciseStateService } from '../../../programs/services/exercise-state.service';
import { WorkoutStateService } from '../../services/workout-state.service';
import { WorkoutHistoryService } from '../../services/workout-history.service';

type ExecutionPhase = 'SELECT_REPS' | 'EXECUTING' | 'RESTING' | 'COMPLETED';

interface SetLog {
  setIndex: number;
  repsCompleted: number;
  completedAt: Date;
}

@Component({
  selector: 'app-exercise-execution',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="execution-container">
      @if (exercise()) {
        <!-- FULL VIEWPORT BACKGROUND -->
        <div class="viewport-background">
          @if (exercise().thumbnailUrl) {
            <img [src]="exercise().thumbnailUrl" [alt]="exercise().excersiceName" class="bg-image" />
          } @else if (exercise().image) {
            <img [src]="exercise().image" [alt]="exercise().excersiceName" class="bg-image" />
          } @else {
            <div class="bg-placeholder">
              <span>{{ exercise().excersiceName }}</span>
            </div>
          }
          <!-- Dark gradient overlay for text readability -->
          <div class="bg-overlay"></div>
        </div>

        <!-- MOTIVATIONAL MESSAGE -->
        @if (showMotivationalMessage()) {
          <div class="motivational-message-container">
            <div class="motivational-message">
              {{ motivationalMessage() }}
            </div>
          </div>
        }

        <!-- REP SELECTION PHASE -->
        @if (currentPhase() === 'SELECT_REPS') {
          <div class="rep-selector-modal">
            <div class="selector-content">
              <div class="selector-header">
                <p class="selector-title">Set {{ currentSetIndex() }} of {{ totalSets() }}</p>
                <p class="selector-subtitle">How many reps did you complete?</p>
              </div>
              <div class="rep-buttons">
                @for (rep of repOptions(); track rep) {
                  <button
                    class="rep-option"
                    (click)="selectReps(rep)"
                  >
                    {{ rep }}
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- EXECUTION PHASE -->
        @if (currentPhase() === 'EXECUTING') {
          <div class="execution-phase">
            <!-- FLOATING BOTTOM PANEL (GLASSMORPHIC) -->
            <div class="floating-execution-panel">
              <div class="panel-header">
                <h2 class="exercise-name">{{ exercise().excersiceName }}</h2>
                <p class="set-label">Set {{ currentSetIndex() }} of {{ totalSets() }}</p>
              </div>

              <div class="panel-content">
                <div class="metrics-section">
                  <div class="metric-item reps-metric" [class.pulse]="isTimerRunning()">
                    <p class="metric-label">REPS</p>
                    <p class="metric-value">{{ selectedReps() }}</p>
                  </div>

                  @if (exercise().weight) {
                    <div class="metric-item weight-metric">
                      <p class="metric-label">WEIGHT</p>
                      <p class="metric-value">{{ exercise().weight }} <span class="metric-unit">kg</span></p>
                    </div>
                  }

                  <div class="metric-item timer-metric" [class.pulse]="isTimerRunning()">
                    <p class="metric-label">REST</p>
                    <p class="metric-value timer-display">{{ formatTime(executionTimeLeft()) }}</p>
                  </div>
                </div>

                <div class="progress-section">
                  <div class="set-progress">
                    @for (setNum of setNumbers(); track setNum) {
                      <div
                        class="progress-dot"
                        [class.completed]="setNum < currentSetIndex()"
                        [class.current]="setNum === currentSetIndex()"
                        [class.pending]="setNum > currentSetIndex()"
                      >
                        {{ setNum }}
                      </div>
                    }
                  </div>
                </div>

                <div class="actions-section">
                  <button
                    class="action-btn skip-btn"
                    (click)="skipExecutionTimer()"
                    [disabled]="!isTimerRunning()"
                  >
                    <span class="btn-icon">⏭️</span>
                    Skip Timer
                  </button>

                  @if (!isTimerRunning()) {
                    <button class="action-btn save-btn" (click)="saveCurrentSet()">
                      <span class="btn-icon">✓</span>
                      Save Set
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- REST PHASE -->
        @if (currentPhase() === 'RESTING') {
          <div class="rest-phase">
            <div class="floating-rest-panel">
              <div class="rest-header">
                <p class="rest-label">Recovery Time</p>
              </div>

              <div class="rest-content">
                <div class="big-rest-timer" [class.pulse]="true">
                  {{ formatTime(restTimeLeft()) }}
                </div>
                <p class="rest-hint">Set {{ currentSetIndex() + 1 }} coming up...</p>
              </div>

              <div class="rest-progress">
                <div class="set-progress">
                  @for (setNum of setNumbers(); track setNum) {
                    <div
                      class="progress-dot"
                      [class.completed]="setNum < currentSetIndex()"
                      [class.current]="setNum === currentSetIndex()"
                      [class.pending]="setNum > currentSetIndex()"
                    >
                      {{ setNum }}
                    </div>
                  }
                </div>
              </div>

              <button class="skip-rest-btn" (click)="skipRest()">
                <span class="btn-icon">⚡</span>
                Skip Rest & Continue
              </button>
            </div>
          </div>
        }

        <!-- COMPLETION PHASE -->
        @if (currentPhase() === 'COMPLETED') {
          <div class="completion-modal-overlay">
            <div class="completion-modal-card">
              <div class="success-icon">✓</div>
              <h2>Exercise Complete!</h2>
              <p class="completion-exercise-name">{{ exercise().excersiceName }}</p>
              <p class="subtitle">All {{ totalSets() }} sets finished</p>
              <div class="completion-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ totalRepsCompleted() }}</span>
                  <span class="stat-label">Total Reps</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-value">{{ totalSets() }}</span>
                  <span class="stat-label">Sets Completed</span>
                </div>
              </div>
              <button class="btn-continue" (click)="goToNextExercise()">
                Continue to Next Exercise
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .execution-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100vh;
      min-height: 100vh;
      background: #000;
      overflow: hidden;
      position: relative;
    }

    /* ========== VIEWPORT BACKGROUND ========== */
    .viewport-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      overflow: hidden;
    }

    .bg-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .bg-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      text-align: center;
      padding: 2rem;
    }

    .bg-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0.5) 50%,
        rgba(0, 0, 0, 0.8) 100%
      );
    }

    /* ========== MOTIVATIONAL MESSAGE ========== */
    .motivational-message-container {
      position: fixed;
      top: 2rem;
      left: 2rem;
      z-index: 300;
      pointer-events: none;
    }

    .motivational-message {
      background: rgba(255, 255, 255, 0.95);
      color: #1a1a1a;
      padding: 1.5rem 2.5rem;
      border-radius: 20px;
      font-size: 1.6rem;
      font-weight: 700;
      text-align: left;
      letter-spacing: 0.5px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                  0 0 40px rgba(102, 126, 234, 0.4);
      border: 2px solid rgba(102, 126, 234, 0.3);
      backdrop-filter: blur(10px);
      animation: motivationalSlideIn 5s ease-in-out forwards;
      white-space: nowrap;
    }

    @keyframes motivationalSlideIn {
      0% {
        opacity: 0;
        transform: translateX(-50px);
      }
      10% {
        opacity: 1;
        transform: translateX(0);
      }
      90% {
        opacity: 1;
        transform: translateX(0);
      }
      100% {
        opacity: 0;
        transform: translateX(-50px);
      }
    }

    /* ========== REP SELECTION MODAL ========== */
    .rep-selector-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      animation: fadeIn 0.3s ease;
      backdrop-filter: blur(5px);
    }

    .selector-content {
      background: rgba(32, 32, 48, 0.95);
      border-radius: 24px;
      padding: 3rem 2rem;
      max-width: 480px;
      width: 90%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2.5rem;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6),
                  0 0 60px rgba(102, 126, 234, 0.2);
      border: 1px solid rgba(102, 126, 234, 0.2);
      backdrop-filter: blur(20px);
      animation: slideUp 0.4s ease;
    }

    .selector-header {
      text-align: center;
    }

    .selector-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
      color: #667eea;
      letter-spacing: 1px;
    }

    .selector-subtitle {
      margin: 0.75rem 0 0;
      font-size: 1.05rem;
      font-weight: 500;
      color: #bbb;
    }

    .rep-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      width: 100%;
    }

    .rep-option {
      background: rgba(60, 60, 80, 0.6);
      color: white;
      border: 2px solid rgba(102, 126, 234, 0.3);
      padding: 1.5rem 1rem;
      border-radius: 12px;
      font-size: 1.3rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }

    .rep-option::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .rep-option:hover {
      background: rgba(102, 126, 234, 0.2);
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(102, 126, 234, 0.25);
    }

    .rep-option:active {
      transform: scale(0.92);
    }

    /* ========== EXECUTION PHASE ========== */
    .execution-phase {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      position: relative;
      z-index: 2;
      padding-bottom: 2rem;
      align-items: center;
      justify-content: flex-end;
    }

    /* ========== FLOATING EXECUTION PANEL (GLASSMORPHISM) ========== */
    .floating-execution-panel {
      background: rgba(20, 20, 32, 0.85);
      border-radius: 24px;
      padding: 2.5rem 2rem;
      width: 90%;
      max-width: 500px;
      margin: 0 auto 2rem;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6),
                  0 0 60px rgba(102, 126, 234, 0.15);
      border: 1.5px solid rgba(102, 126, 234, 0.25);
      backdrop-filter: blur(20px);
      animation: slideUpPanel 0.5s ease;
      position: relative;
      z-index: 10;
    }

    @keyframes slideUpPanel {
      from {
        opacity: 0;
        transform: translateY(60px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .panel-header {
      margin-bottom: 2rem;
      text-align: center;
      border-bottom: 1px solid rgba(102, 126, 234, 0.15);
      padding-bottom: 1.5rem;
    }

    .exercise-name {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 800;
      color: white;
      letter-spacing: 0.5px;
    }

    .set-label {
      margin: 0.5rem 0 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #667eea;
    }

    .panel-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .metrics-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1.5rem;
    }

    .metric-item {
      background: rgba(40, 40, 60, 0.6);
      border-radius: 16px;
      padding: 1.5rem 1rem;
      text-align: center;
      border: 1px solid rgba(102, 126, 234, 0.15);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .metric-item:hover {
      background: rgba(60, 60, 90, 0.7);
      border-color: rgba(102, 126, 234, 0.3);
    }

    .reps-metric {
      border-color: rgba(102, 126, 234, 0.25);
    }

    .reps-metric.pulse {
      animation: metricPulse 1.5s ease-in-out infinite;
    }

    .weight-metric {
      border-color: rgba(76, 175, 80, 0.25);
    }

    .timer-metric {
      border-color: rgba(0, 212, 255, 0.25);
    }

    .timer-metric.pulse {
      animation: timerPulse 1s ease-in-out infinite;
    }

    @keyframes metricPulse {
      0%, 100% { 
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.3);
      }
      50% { 
        transform: scale(1.02);
        box-shadow: 0 0 20px 5px rgba(102, 126, 234, 0.15);
      }
    }

    @keyframes timerPulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.3);
      }
      50% { 
        box-shadow: 0 0 20px 5px rgba(0, 212, 255, 0.15);
      }
    }

    .metric-label {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 700;
      color: #999;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .metric-value {
      margin: 0.75rem 0 0;
      font-size: 2.2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 0.5px;
    }

    .metric-unit {
      font-size: 0.9rem;
      color: #aaa;
    }

    .timer-display {
      font-family: 'Courier New', monospace;
      color: #00d4ff;
      background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .progress-section {
      display: flex;
      justify-content: center;
    }

    .set-progress {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .progress-dot {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(60, 60, 80, 0.6);
      border: 1.5px solid rgba(102, 126, 234, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #999;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor: default;
    }

    .progress-dot.pending {
      opacity: 0.5;
    }

    .progress-dot.current {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
      box-shadow: 0 0 30px rgba(102, 126, 234, 0.5),
                  0 0 60px rgba(102, 126, 234, 0.25);
      transform: scale(1.2);
    }

    .progress-dot.completed {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border-color: #4caf50;
      box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
    }

    .actions-section {
      display: flex;
      gap: 1.2rem;
      margin-top: 0.5rem;
    }

    .action-btn {
      flex: 1;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      position: relative;
      overflow: hidden;
      letter-spacing: 0.3px;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    .action-btn:active::before {
      width: 300px;
      height: 300px;
    }

    .skip-btn {
      background: rgba(60, 60, 80, 0.6);
      color: #ccc;
      border: 1.5px solid rgba(102, 126, 234, 0.15);
      backdrop-filter: blur(10px);
    }

    .skip-btn:hover:not(:disabled) {
      background: rgba(80, 80, 110, 0.8);
      border-color: rgba(102, 126, 234, 0.4);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(102, 126, 234, 0.2);
    }

    .skip-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .save-btn {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border: none;
      box-shadow: 0 12px 28px rgba(76, 175, 80, 0.3);
      position: relative;
    }

    .save-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 18px 40px rgba(76, 175, 80, 0.45);
    }

    .save-btn:active {
      transform: translateY(-1px);
    }

    .btn-icon {
      font-size: 1.2rem;
    }

    /* ========== REST PHASE ========== */
    .rest-phase {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      position: relative;
      z-index: 2;
      padding-bottom: 2rem;
    }

    .floating-rest-panel {
      background: rgba(20, 20, 32, 0.85);
      border-radius: 24px;
      padding: 3rem 2rem;
      width: 90%;
      max-width: 500px;
      margin: 0 auto 2rem;
      text-align: center;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6),
                  0 0 60px rgba(102, 126, 234, 0.15);
      border: 1.5px solid rgba(102, 126, 234, 0.25);
      backdrop-filter: blur(20px);
      animation: slideUpPanel 0.5s ease;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .rest-header {
      border-bottom: 1px solid rgba(102, 126, 234, 0.15);
      padding-bottom: 1.5rem;
    }

    .rest-label {
      color: #667eea;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .rest-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .big-rest-timer {
      font-size: 5.5rem;
      font-weight: 800;
      font-family: 'Courier New', monospace;
      color: #00d4ff;
      background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .big-rest-timer.pulse {
      animation: bigPulse 1s ease-in-out infinite;
    }

    @keyframes bigPulse {
      0%, 100% { 
        transform: scale(1);
        opacity: 1;
      }
      50% { 
        transform: scale(1.05);
        opacity: 0.8;
      }
    }

    .rest-hint {
      color: #aaa;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
    }

    .rest-progress {
      display: flex;
      justify-content: center;
    }

    .skip-rest-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1.2rem 2.5rem;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 18px 40px rgba(102, 126, 234, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      letter-spacing: 0.3px;
      position: relative;
      overflow: hidden;
    }

    .skip-rest-btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    .skip-rest-btn:hover {
      transform: translateY(-4px);
      box-shadow: 0 24px 50px rgba(102, 126, 234, 0.45);
    }

    .skip-rest-btn:active {
      transform: translateY(-1px);
    }

    .skip-rest-btn:active::before {
      width: 300px;
      height: 300px;
    }

    /* ========== COMPLETION PHASE ========== */
    .completion-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      animation: fadeIn 0.3s ease;
      backdrop-filter: blur(5px);
    }

    .completion-modal-card {
      background: rgba(20, 20, 32, 0.95);
      border-radius: 24px;
      padding: 3.5rem 2.5rem;
      max-width: 450px;
      width: 90%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.8rem;
      box-shadow: 0 30px 90px rgba(0, 0, 0, 0.7),
                  0 0 60px rgba(76, 175, 80, 0.2);
      border: 1.5px solid rgba(76, 175, 80, 0.25);
      backdrop-filter: blur(20px);
      animation: slideUp 0.5s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .success-icon {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      font-weight: 800;
      animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 20px 50px rgba(76, 175, 80, 0.3),
                  0 0 40px rgba(76, 175, 80, 0.2);
    }

    @keyframes scaleIn {
      from { 
        transform: scale(0);
        opacity: 0;
      }
      to { 
        transform: scale(1);
        opacity: 1;
      }
    }

    .completion-modal-card h2 {
      margin: 0;
      font-size: 2.2rem;
      font-weight: 800;
      color: white;
      letter-spacing: 0.5px;
    }

    .completion-exercise-name {
      margin: 0;
      color: #667eea;
      font-size: 1.4rem;
      font-weight: 700;
    }

    .subtitle {
      font-size: 1rem;
      color: #999;
      margin: 0;
    }

    .completion-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 1.5rem 0;
      border: 1px solid rgba(102, 126, 234, 0.15);
      border-radius: 16px;
      background: rgba(40, 40, 60, 0.4);
      backdrop-filter: blur(10px);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #999;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .stat-divider {
      width: 1px;
      height: 50px;
      background: rgba(102, 126, 234, 0.2);
    }

    .btn-continue {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1.2rem 2.5rem;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      width: 100%;
      box-shadow: 0 18px 40px rgba(102, 126, 234, 0.3);
      letter-spacing: 0.3px;
      position: relative;
      overflow: hidden;
    }

    .btn-continue::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    .btn-continue:hover {
      transform: translateY(-4px);
      box-shadow: 0 24px 50px rgba(102, 126, 234, 0.45);
    }

    .btn-continue:active {
      transform: translateY(-1px);
    }

    .btn-continue:active::before {
      width: 300px;
      height: 300px;
    }

    /* ========== ANIMATIONS ========== */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* ========== RESPONSIVE DESIGN ========== */
    @media (max-width: 600px) {
      .floating-execution-panel {
        width: 95%;
        padding: 2rem 1.5rem;
      }

      .exercise-name {
        font-size: 1.5rem;
      }

      .metrics-section {
        gap: 1rem;
      }

      .metric-item {
        padding: 1.2rem 0.8rem;
      }

      .metric-value {
        font-size: 1.8rem;
      }

      .action-btn {
        padding: 0.9rem 1.2rem;
        font-size: 0.95rem;
      }

      .floating-rest-panel {
        width: 95%;
        padding: 2.5rem 1.5rem;
      }

      .big-rest-timer {
        font-size: 4.5rem;
      }

      .completion-modal-card {
        width: 95%;
        padding: 2.5rem 1.5rem;
      }

      .success-icon {
        width: 100px;
        height: 100px;
        font-size: 3rem;
      }

      .completion-modal-card h2 {
        font-size: 1.8rem;
      }

      .selector-content {
        width: 95%;
        padding: 2rem 1.5rem;
      }

      .selector-title {
        font-size: 1.3rem;
      }

      .rep-buttons {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.8rem;
      }

      .rep-option {
        padding: 1.2rem 0.8rem;
        font-size: 1.1rem;
      }

      .motivational-message {
        padding: 1.5rem 2rem;
        font-size: 1.4rem;
      }
    }

    @media (max-width: 400px) {
      .metric-item {
        padding: 1rem 0.6rem;
      }

      .metric-label {
        font-size: 0.65rem;
      }

      .metric-value {
        font-size: 1.5rem;
        margin-top: 0.5rem;
      }

      .action-btn {
        padding: 0.8rem 1rem;
        font-size: 0.9rem;
      }

      .big-rest-timer {
        font-size: 3.5rem;
      }

      .rest-hint {
        font-size: 0.95rem;
      }

      .selector-subtitle {
        font-size: 0.95rem;
      }

      .rep-buttons {
        grid-template-columns: repeat(2, 1fr);
      }

      .motivational-message {
        padding: 1.2rem 1.5rem;
        font-size: 1.2rem;
        max-width: 85vw;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseExecutionComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private programService = inject(ProgramService);
  private exerciseStateService = inject(ExerciseStateService);
  private workoutStateService = inject(WorkoutStateService);
  private workoutHistoryService = inject(WorkoutHistoryService);
  private destroy$ = new Subject<void>();

  exercise = signal<any>(null);
  currentPhase = signal<ExecutionPhase>('SELECT_REPS');
  currentSetIndex = signal(1);
  selectedReps = signal<number | null>(null);
  executionTimeLeft = signal(30);
  restTimeLeft = signal(60);
  isTimerRunning = signal(false);
  setsLog = signal<SetLog[]>([]);
  showCompletionNotification = signal(false);
  showMotivationalMessage = signal(false);
  motivationalMessage = signal('');

  private timerSubscription: Subscription | null = null;

  private motivationalMessages = [
    '🔥 Great set! Keep pushing!',
    '💪 You\'re getting stronger!',
    '🚀 One step closer to your goal!',
    '⚡ Unstoppable! Keep it up!',
    '🎯 Locked in! Next set incoming!',
    '🏆 Championship performance!',
    '💥 You\'ve got this!',
    '✨ Crushing it!',
    '🌟 Absolute beast mode!',
    '🔥 That\'s how it\'s done!'
  ];

  totalSets = computed(() => {
    const ex = this.exercise();
    return ex ? Number(ex.sets) || 3 : 3;
  });

  repOptions = computed(() => {
    const ex = this.exercise();
    if (!ex) return [];
    const reps = String(ex.reps || '');
    const match = reps.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      const min = parseInt(match[1], 10);
      const max = parseInt(match[2], 10);
      const opts: number[] = [];
      for (let i = min; i <= max; i++) opts.push(i);
      return opts;
    }
    const single = parseInt(reps, 10);
    return isNaN(single) ? [] : [single];
  });

  setNumbers = computed(() => {
    const total = this.totalSets();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  totalRepsCompleted = computed(() => {
    return this.setsLog().reduce((sum, log) => sum + log.repsCompleted, 0);
  });

  ngOnInit(): void {
    this.restorePersistedState();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const exerciseId = Number(params['exerciseId']);
      this.loadExercise(exerciseId);
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadExercise(exerciseId: number): void {
    const savedExercise = this.exerciseStateService.getCurrentExercise();
    if (savedExercise) {
      this.exercise.set(savedExercise);
      return;
    }

    const dayId = this.route.snapshot.queryParams['dayId'];
    if (dayId) {
      this.programService.getExercisesByDayId(Number(dayId))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (day: any) => {
            const found = day.exercises?.find((e: any) => e.id === exerciseId || e.exerciseId === exerciseId);
            if (found) {
              this.exercise.set(found);
            }
          }
        });
    }
  }

  selectReps(reps: number): void {
    this.selectedReps.set(reps);
    this.startExecutionTimer();
  }

  private startExecutionTimer(): void {
    this.currentPhase.set('EXECUTING');
    this.isTimerRunning.set(true);
    const timerDuration = Math.ceil((this.selectedReps() || 10) / 2);
    this.executionTimeLeft.set(timerDuration);

    this.clearTimer();
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.executionTimeLeft.update((v) => {
          if (v <= 1) {
            this.isTimerRunning.set(false);
            this.clearTimer();
            return 0;
          }
          return v - 1;
        });
      });
  }

  skipExecutionTimer(): void {
    this.executionTimeLeft.set(0);
    this.isTimerRunning.set(false);
    this.clearTimer();
  }

  saveCurrentSet(): void {
    const reps = this.selectedReps();
    if (!reps) return;

    // Show motivational message
    this.showMotivationalMessageBriefly();

    const setLog: SetLog = {
      setIndex: this.currentSetIndex(),
      repsCompleted: reps,
      completedAt: new Date()
    };

    this.setsLog.update((logs) => [...logs, setLog]);
    this.workoutStateService.logSetCompletion(
      this.exercise().exerciseId ?? this.exercise().id,
      this.currentSetIndex(),
      reps
    );

    if (this.currentSetIndex() < this.totalSets()) {
      this.startRestTimer();
    } else {
      this.completeExercise();
    }
  }

  private showMotivationalMessageBriefly(): void {
    const randomIndex = Math.floor(Math.random() * this.motivationalMessages.length);
    this.motivationalMessage.set(this.motivationalMessages[randomIndex]);
    this.showMotivationalMessage.set(true);

    setTimeout(() => {
      this.showMotivationalMessage.set(false);
    }, 5000);
  }

  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private startRestTimer(): void {
    this.currentPhase.set('RESTING');
    const restSeconds = this.exercise().restSeconds || 60;
    this.restTimeLeft.set(restSeconds);

    this.clearTimer();
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.restTimeLeft.update((v) => {
          if (v <= 1) {
            this.clearTimer();
            this.goToNextSet();
            return 0;
          }
          return v - 1;
        });
      });
  }

  skipRest(): void {
    this.restTimeLeft.set(0);
    this.clearTimer();
    this.goToNextSet();
  }

  private goToNextSet(): void {
    this.currentSetIndex.update((idx) => idx + 1);
    this.selectedReps.set(null);
    this.currentPhase.set('SELECT_REPS');
  }

  private completeExercise(): void {
    const exerciseId = this.exercise().exerciseId ?? this.exercise().id;
    const session = this.workoutStateService.session();
    const durationSeconds = session
      ? Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)
      : 0;

    this.workoutStateService.completeExercise(exerciseId, durationSeconds);
    this.persistExerciseCompletion(exerciseId);
    this.currentPhase.set('COMPLETED');
    this.showCompletionNotificationBriefly();
  }

  private persistExerciseCompletion(exerciseId: number): void {
    const dayId = this.route.snapshot.queryParams['dayId'];
    if (!dayId) return;

    const storageKey = `workout_day_${dayId}`;
    const existingData = localStorage.getItem(storageKey);
    const workoutData = existingData ? JSON.parse(existingData) : {};

    if (!workoutData.completedExercises) {
      workoutData.completedExercises = [];
    }
    if (!workoutData.completedExercises.includes(exerciseId)) {
      workoutData.completedExercises.push(exerciseId);
    }

    workoutData.exercises = workoutData.exercises || {};
    workoutData.exercises[exerciseId] = {
      exerciseName: this.exercise().excersiceName || this.exercise().exerciseName,
      sets: this.setsLog(),
      completedAt: new Date().toISOString()
    };

    localStorage.setItem(storageKey, JSON.stringify(workoutData));
  }

  private restorePersistedState(): void {
    const dayId = this.route.snapshot.queryParams['dayId'];
    if (!dayId) return;

    const storageKey = `workout_day_${dayId}`;
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const workoutData = JSON.parse(savedData);
        if (workoutData.completedExercises && workoutData.completedExercises.length > 0) {
          const currentExerciseId = Number(this.route.snapshot.params['exerciseId']);
          if (workoutData.completedExercises.includes(currentExerciseId)) {
            this.currentPhase.set('COMPLETED');
            if (workoutData.exercises && workoutData.exercises[currentExerciseId]) {
              this.setsLog.set(workoutData.exercises[currentExerciseId].sets);
            }
          }
        }
      } catch (e) {
        console.error('Failed to restore workout state', e);
      }
    }
  }

  private showCompletionNotificationBriefly(): void {
    this.showCompletionNotification.set(true);
    setTimeout(() => {
      this.showCompletionNotification.set(false);
    }, 3000);
  }

  goToNextExercise(): void {
    const session = this.workoutStateService.session();
    if (!session) {
      this.router.navigate(['/programs']);
      return;
    }

    const currentExerciseId = this.exercise().exerciseId ?? this.exercise().id;
    const currentIndex = session.exercises.findIndex((e) => e.exerciseId === currentExerciseId);

    console.log(`✅ Exercise ${currentIndex + 1} of ${session.exercises.length} completed`);
    console.log(`📋 Current Exercise ID: ${currentExerciseId}`);

    const nextIndex = currentIndex + 1;
    const dayId = this.route.snapshot.queryParams['dayId'];
    const programId = this.route.snapshot.queryParams['programId'];

    if (nextIndex < session.exercises.length) {
      // There is a next exercise
      const nextExerciseId = session.exercises[nextIndex].exerciseId;

      console.log(`➡️ Moving to Exercise ${nextIndex + 1}/${session.exercises.length}`);
      console.log(`📍 Next Exercise ID: ${nextExerciseId}`);
      console.log(`⏱️ Returning to day page, auto-start in 10 seconds...`);

      // Navigate back to day page with autoStart flag
      this.router.navigate(['/programs', programId, 'days', dayId], {
        queryParams: { autoStart: 'true' }
      });
    } else {
      // This was the last exercise
      console.log(`⏹️ LAST EXERCISE COMPLETED! (${currentIndex + 1} of ${session.exercises.length})`);
      console.log(`🔄 Initiating workout finalization...`);
      this.finalizeWorkout();
    }
  }

  private async finalizeWorkout(): Promise<void> {
    try {
      console.log('🏋️ ALL EXERCISES COMPLETED - FINALIZING WORKOUT');
      const session = this.workoutStateService.session();
      console.log('📊 Workout Summary:', {
        totalExercises: session?.exercises.length,
        completedExercises: session?.completedExerciseIds.length,
        startedAt: session?.startedAt
      });

      // Submit the completed workout
      console.log('📤 Submitting workout to backend...');
      await this.workoutStateService.submitWorkoutLog();
      console.log('✅ Workout submitted successfully!');

      // Save to frontend history AFTER successful API call
      if (session) {
        const dayId = session.programDayId;
        const numberOfExercises = session.exercises.length;

        // Calculate actual duration
        const endTime = new Date();
        let durationMinutes = Math.floor((endTime.getTime() - new Date(session.startedAt).getTime()) / 60000);

        // Apply defensive clamping (same as backend validation)
        const MIN_DURATION = 1;
        const MAX_DURATION = 600;
        if (durationMinutes < MIN_DURATION) {
          durationMinutes = MIN_DURATION;
        } else if (durationMinutes > MAX_DURATION) {
          durationMinutes = MAX_DURATION;
        }

        // Get day name (fallback to generic name)
        let dayName = `Day ${dayId}`;
        try {
          const queryDayId = this.route.snapshot.queryParams['dayId'];
          if (queryDayId) {
            const dayData = await this.programService.getExercisesByDayId(Number(queryDayId)).toPromise();
            if (dayData?.title) {
              dayName = dayData.title;
            }
          }
        } catch (e) {
          console.warn('Could not fetch day name, using default');
        }

        // Save to workout history
        this.workoutHistoryService.saveCompletedWorkout(
          dayId,
          dayName,
          numberOfExercises,
          durationMinutes
        );
        console.log('📝 Workout saved to history');
      }

      // Clear the workout session
      this.workoutStateService.clearWorkout();
      console.log('🧹 Workout session cleared');

      // Navigate to completion page
      const dayId = this.route.snapshot.queryParams['dayId'];
      const programId = this.route.snapshot.queryParams['programId'];

      console.log('🎉 WORKOUT DAY COMPLETED SUCCESSFULLY!');
      console.log('📍 Navigating to:', `/programs/${programId}/days/${dayId}?completed=true`);

      if (programId && dayId) {
        this.router.navigate(['/programs', programId, 'days', dayId], {
          queryParams: { completed: 'true' }
        });
      } else {
        this.router.navigate(['/programs']);
      }
    } catch (error) {
      console.error('❌ Error finalizing workout:', error);
      this.router.navigate(['/programs']);
    }
  }

  private clearTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }
}
