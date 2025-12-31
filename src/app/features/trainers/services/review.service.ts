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
   */
  createTrainerReview(trainerId: number, request: CreateReviewRequest): Observable<Review> {
    return this.apiService.post<Review>(`/api/client/reviews/trainer/${trainerId}`, request);
  }

  /**
   * Get all reviews for a trainer
   */
  getTrainerReviews(trainerId: number): Observable<Review[]> {
    return this.apiService.get<Review[]>(`/api/trainer/reviews/trainer/${trainerId}`);
  }
}

