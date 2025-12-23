import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Review, CreateReviewRequest } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiService = inject(ApiService);

  createTrainerReview(trainerId: number, request: CreateReviewRequest): Observable<Review> {
    return this.apiService.post<Review>(`/api/client/ReviewClient/trainer/${trainerId}`, request);
  }

  getTrainerReviews(trainerId: number): Observable<Review[]> {
    return this.apiService.get<Review[]>(`/api/trainer/ReviewClient/trainer/${trainerId}`);
  }
}
