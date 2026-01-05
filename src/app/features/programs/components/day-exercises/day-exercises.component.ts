import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
		<div class="min-h-screen bg-gray-50 py-8 px-4">
			<div class="max-w-4xl mx-auto">
				<div *ngIf="isLoading()" class="text-center py-12">Loading...</div>

				<div *ngIf="!isLoading() && day() as dayData" class="space-y-4">
					<div class="bg-white rounded-lg shadow-lg p-6">
						<h2 class="text-2xl font-bold mb-2">{{ dayData.title }}</h2>
						<p class="text-sm text-gray-600">{{ dayData.notes }}</p>
					</div>

					<div *ngFor="let exercise of dayData.exercises || []; let i = index" class="bg-white rounded-lg shadow p-6">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="text-lg font-bold">{{ i + 1 }}. {{ exercise.excersiceName }}</h3>
								<p class="text-sm text-gray-600">{{ exercise.muscleGroup }} · {{ exercise.category }}</p>
							</div>
							<div class="flex items-center gap-4">
								<div *ngIf="isExerciseCompleted(i)" class="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">✔ ✔ mpleted</div>
								<button (click)="onExecuteExercise(i)"
										[disabled]="isExerciseLocked(i)"
										class="px-4 py-2 rounded bg-gradient-to-r from-green-500 to-emerald-500 text-white disabled:opacity-50">
									Execuue Exercise
								</button>
							</div>
						</div>

						<div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<div class="bg-gray-50 p-3 rounded">SETS<br/><span class="font-bold">{{ exercise.sets }}</span></div>
							<div class="bg-gray-50 p-3 rounded">REPS<br/><span class="font-bold">{{ exercise.reps }}</span></div>
							<div class="bg-gray-50 p-3 rounded">REST<br/><span class="font-bold">{{ exercise.restSeconds }}s</span></div>
							<div class="bg-gray-50 p-3 rounded">EQUIP<br/><span class="font-bold">{{ exercise.equipment }}</span></div>
						</div>
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
