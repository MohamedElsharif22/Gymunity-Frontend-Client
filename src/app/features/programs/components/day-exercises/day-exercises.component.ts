import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgramService, ProgramDay } from '../../services/program.service';
import { WorkoutStateService } from '../../../workout/services/workout-state.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-program-day-exercises',
	standalone: true,
	imports: [CommonModule, RouterModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
			<div class="max-w-5xl mx-auto">
				<!-- Back Button & Header -->
				<div class="mb-8">
					<button (click)="goBack()" class="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold mb-4 group">
						<svg class="w-5 h-5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
						</svg>
						Back to Weeks
					</button>
				</div>

				<!-- Loading State -->
				<div *ngIf="isLoading()" class="flex items-center justify-center py-20">
					<div class="relative">
						<div class="w-20 h-20 border-4 border-sky-200 rounded-full"></div>
						<div class="w-20 h-20 border-4 border-sky-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
					</div>
				</div>

				<!-- Content -->
				<div *ngIf="!isLoading() && day() as dayData" class="space-y-6">
					<!-- Day Header Card -->
					<div class="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
						<div class="flex items-start justify-between">
							<div>
								<h1 class="text-4xl font-bold mb-2">{{ dayData.title }}</h1>
								<p class="text-sky-100 text-lg">{{ dayData.notes }}</p>
							</div>
							<div class="flex flex-col items-end gap-2">
								<span class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
									{{ completedCount() }} / {{ totalExercises() }} Completed
								</span>
								<div class="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
									<div class="h-full bg-green-400 transition-all duration-500"
										[style.width.%]="progressPercentage()"></div>
								</div>
							</div>
						</div>
					</div>

					<!-- Exercises Grid -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div *ngFor="let exercise of dayData.exercises || []; let i = index"
							class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden border border-gray-100">

							<!-- Exercise Header -->
							<div class="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
								<div class="flex items-start justify-between mb-3">
									<div>
										<span class="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-2">Exercise {{ i + 1 }}</span>
										<h3 class="text-2xl font-bold">{{ exercise.excersiceName }}</h3>
										<p class="text-indigo-100 text-sm mt-1">{{ exercise.muscleGroup }}</p>
									</div>
									<div *ngIf="isExerciseCompleted(i)" class="bg-green-500 rounded-full p-2">
										<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
										</svg>
									</div>
								</div>
							</div>

							<!-- Exercise Details -->
							<div class="p-6">
								<!-- Category & Equipment -->
								<div class="flex flex-wrap gap-2 mb-4">
									<span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{{ exercise.category }}</span>
									<span class="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{{ exercise.equipment }}</span>
								</div>

								<!-- Sets, Reps, Rest Grid -->
								<div class="grid grid-cols-3 gap-3 mb-6">
									<div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
										<p class="text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wider">Sets</p>
										<p class="text-3xl font-bold text-blue-600">{{ exercise.sets }}</p>
									</div>
									<div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
										<p class="text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wider">Reps</p>
										<p class="text-3xl font-bold text-green-600">{{ exercise.reps }}</p>
									</div>
									<div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center border border-orange-200">
										<p class="text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wider">Rest</p>
										<p class="text-2xl font-bold text-orange-600">{{ exercise.restSeconds }}<span class="text-lg">s</span></p>
									</div>
								</div>

								<!-- Execute Button -->
								<button (click)="onExecuteExercise(i)"
										[disabled]="isExerciseLocked(i)"
										class="w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
										[ngClass]="{
											'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg': !isExerciseLocked(i),
											'bg-gray-300 text-gray-500 cursor-not-allowed': isExerciseLocked(i)
										}">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M17.657 17.657a8 8 0 01-11.314 0m11.314-11.314a8 8 0 00-11.314 0M9 10a1 1 0 11-2 0 1 1 0 012 0z"></path>
									</svg>
									{{ isExerciseLocked(i) ? 'Complete Previous Exercises First' : isExerciseCompleted(i) ? 'Execute Again' : 'Start Exercise' }}
								</button>
							</div>
						</div>
					</div>

					<!-- All Completed Message -->
					<div *ngIf="allCompleted()" class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg p-8 text-white text-center">
						<div class="mb-4">
							<svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
							</svg>
						</div>
						<h3 class="text-2xl font-bold mb-2">Excellent Work! 🎉</h3>
						<p class="text-green-100">You've completed all exercises for this day!</p>
					</div>
				</div>
			</div>
		</div>
	`
})
export class ProgramDayExercisesComponent implements OnInit, OnDestroy {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private programService = inject(ProgramService);
	private workoutStateService = inject(WorkoutStateService);

	private destroy$ = new Subject<void>();

	day = signal<ProgramDay | null>(null);
	isLoading = signal(true);

	// Computed signals for progress tracking
	totalExercises = computed(() => this.day()?.exercises?.length || 0);
	completedCount = computed(() => {
		const dayData = this.day();
		if (!dayData || !dayData.exercises) return 0;
		return dayData.exercises.filter((_, i) => this.isExerciseCompleted(i)).length;
	});
	progressPercentage = computed(() => {
		const total = this.totalExercises();
		return total > 0 ? (this.completedCount() / total) * 100 : 0;
	});
	allCompleted = computed(() => this.completedCount() === this.totalExercises() && this.totalExercises() > 0);

	ngOnInit() {
		this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
			const id = params.get('id') || params.get('dayId');
			if (id) {
				this.loadDay(parseInt(id, 10));
			} else {
				// try navigation state
				const navigation = this.router.getCurrentNavigation();
				const dayFromState = (navigation?.extras?.state as any)?.day;
				if (dayFromState) {
					this.day.set(dayFromState);
					this.isLoading.set(false);
				} else {
					this.isLoading.set(false);
				}
			}
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private loadDay(dayId: number) {
		this.isLoading.set(true);
		this.programService.getExercisesByDayId(dayId).pipe(takeUntil(this.destroy$)).subscribe({
			next: d => { this.day.set(d); this.isLoading.set(false); },
			error: e => { console.error('Failed loading day', e); this.isLoading.set(false); }
		});
	}

	goBack() {
		this.router.navigate(['/programs']);
	}

	onExecuteExercise(index: number) {
		const dayData = this.day();
		if (!dayData) return;

		const exercise = dayData.exercises?.[index] as any;
		const exerciseId = exercise?.exerciseId ?? exercise?.id ?? null;

		if (!exerciseId) return;

		// Initialize workout state if not already done
		if (!this.workoutStateService.session()) {
			const dayId = dayData.id || (this.route.snapshot.paramMap.get('dayId') || this.route.snapshot.paramMap.get('id'));
			this.workoutStateService.initializeWorkout(
				Number(dayId),
				dayData.exercises?.map((ex: any) => ({
					id: ex.exerciseId ?? ex.id,
					sets: Number(ex.sets),
					reps: ex.reps
				})) || []
			);
		}

		this.router.navigate(['/exercise', exerciseId, 'execute']);
	}

	isExerciseCompleted(index: number): boolean {
		const dayData = this.day();
		if (!dayData || !dayData.exercises) return false;
		const exercise = dayData.exercises[index] as any;
		const exerciseId = exercise?.exerciseId ?? exercise?.id;
		return this.workoutStateService.isExerciseCompleted(exerciseId);
	}

	isExerciseLocked(index: number): boolean {
		const dayData = this.day();
		if (!dayData || !dayData.exercises) return false;
		const exercise = dayData.exercises[index] as any;
		const exerciseId = exercise?.exerciseId ?? exercise?.id;
		return this.workoutStateService.isExerciseLocked(exerciseId);
	}
}
