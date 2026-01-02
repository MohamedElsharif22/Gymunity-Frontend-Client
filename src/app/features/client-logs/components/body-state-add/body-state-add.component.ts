import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientLogsService } from '../../../../core/services/client-logs.service';
import { CreateBodyStateLogRequest } from '../../../../core/models/client-logs.model';

@Component({
  selector: 'app-body-state-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './body-state-add.component.html',
  styleUrl: './body-state-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BodyStateAddComponent implements OnInit, OnDestroy {
  private clientLogsService = inject(ClientLogsService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  loading = signal(false);
  error = signal('');
  success = signal(false);
  measurementsError = signal('');

  form = this.formBuilder.group({
    weightKg: [null as number | null, [Validators.required, Validators.min(20), Validators.max(500)]],
    bodyFatPercent: [null as number | null, [Validators.min(1), Validators.max(80)]],
    measurementsJson: [''],
    notes: [''],
    photoFrontUrl: [''],
    photoSideUrl: [''],
    photoBackUrl: ['']
  });

  ngOnInit(): void {
    // Initialize form
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.error.set('Please fill in all required fields correctly');
      return;
    }

    // Validate measurements JSON if provided
    const measurementsJson = this.form.get('measurementsJson')?.value;
    if (measurementsJson) {
      try {
        JSON.parse(measurementsJson);
        this.measurementsError.set('');
      } catch {
        this.measurementsError.set('Measurements must be valid JSON');
        return;
      }
    }

    this.loading.set(true);
    this.error.set('');

    const payload: CreateBodyStateLogRequest = {
      weightKg: this.form.get('weightKg')?.value || undefined,
      bodyFatPercent: this.form.get('bodyFatPercent')?.value || undefined,
      measurementsJson: this.form.get('measurementsJson')?.value || undefined,
      notes: this.form.get('notes')?.value || undefined,
      photoFrontUrl: this.form.get('photoFrontUrl')?.value || undefined,
      photoSideUrl: this.form.get('photoSideUrl')?.value || undefined,
      photoBackUrl: this.form.get('photoBackUrl')?.value || undefined
    };

    this.clientLogsService.addBodyStateLog(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success.set(true);
          this.loading.set(false);
          setTimeout(() => {
            this.router.navigate(['/client/body-state']);
          }, 1500);
        },
        error: (err) => {
          console.error('[BodyStateAddComponent] Error adding log:', err);
          this.error.set(err?.error?.message || 'Failed to add body state log');
          this.loading.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
