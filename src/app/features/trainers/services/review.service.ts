import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Review, CreateReviewRequest } from '../../../core/models';

/**
 * Review Service
 * Handles trainer reviews and ratings
 * Follows Angular best practices with providedIn: 'root' and inject()
 */
@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly apiService = inject(ApiService);

  /**
   * Create a review for a trainer
   * POST /api/client/ReviewClient/trainer/{trainerId}
   */
  createTrainerReview(trainerId: number, request: CreateReviewRequest): Observable<Review> {
    const url = `/api/client/ReviewClient/trainer/${trainerId}`;
    console.log('📤 Review API Request:', { url, body: request });
    return this.apiService.post<Review>(url, request);
  }
}

