import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Package, Program, TrainerProfile } from '../../../core/models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HomeClientService {
  private apiService = inject(ApiService);

  searchPackagesTrainersPrograms(term: string): Observable<any> {
    const params = new HttpParams().set('term', term);
    return this.apiService.get<any>('/api/HomeClient/search', params);
  }

  getAllPackages(): Observable<Package[]> {
    return this.apiService.get<Package[]>('/api/HomeClient/packages');
  }

  getPackageById(packageId: number): Observable<Package> {
    return this.apiService.get<Package>(`/api/HomeClient/packages/${packageId}`);
  }

  getPackagesByTrainer(trainerId: string): Observable<Package[]> {
    const params = new HttpParams().set('trainerId', trainerId);
    return this.apiService.get<Package[]>('/api/HomeClient/packages/by-trainer', params);
  }

  getTrainerById(trainerId: number): Observable<TrainerProfile> {
    return this.apiService.get<TrainerProfile>(`/api/HomeClient/trainer/${trainerId}`);
  }

  getTrainerByUserId(userId: string): Observable<TrainerProfile> {
    const params = new HttpParams().set('userId', userId);
    return this.apiService.get<TrainerProfile>('/api/HomeClient/trainer/by-user', params);
  }

  getAllPrograms(): Observable<Program[]> {
    return this.apiService.get<Program[]>('/api/HomeClient/programs');
  }

  getProgramById(programId: number): Observable<Program> {
    return this.apiService.get<Program>(`/api/HomeClient/programs/${programId}`);
  }
}
