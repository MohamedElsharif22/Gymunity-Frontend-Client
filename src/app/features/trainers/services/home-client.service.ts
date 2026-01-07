import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Package, Program, TrainerProfile, SearchResults } from '../../../core/models';
import { HttpParams } from '@angular/common/http';

/**
 * Home Client Service
 * Handles discovery features: searching for packages, trainers, and programs
 * Public endpoints for unauthenticated users
 * Follows Angular best practices with providedIn: 'root' and inject()
 */
@Injectable({
  providedIn: 'root'
})
export class HomeClientService {
  private readonly apiService = inject(ApiService);

  // ==================== Search ====================

  /**
   * Global search across trainers, packages, and programs
   */
  search(term: string): Observable<SearchResults> {
    const params = new HttpParams().set('term', term);
    return this.apiService.get<SearchResults>('/api/homeclient/search', params);
  }

  // ==================== Packages ====================

  /**
   * Get all available packages
   */
  getAllPackages(): Observable<Package[]> {
    return this.apiService.get<Package[]>('/api/homeclient/packages');
  }

  /**
   * Get package by ID
   */
  getPackageById(packageId: number): Observable<Package> {
    return this.apiService.get<Package>(`/api/homeclient/packages/${packageId}`);
  }

  /**
   * Get packages by trainer ID
   */
  getPackagesByTrainer(trainerId: string): Observable<Package[]> {
    return this.apiService.get<Package[]>(`/api/homeclient/packages/trainer/${trainerId}`);
  }

  // ==================== Trainers ====================

  /**
   * Get all trainers
   * GET /api/client/homeclient/trainers
   */
  getAllTrainers(): Observable<any[]> {
    return this.apiService.get<any[]>('/api/homeclient/trainers');
  }

  /**
   * Get trainer by ID
   * GET /api/client/homeclient/trainers/{id}
   */
  getTrainerById(trainerId: number): Observable<any> {
    return this.apiService.get<any>(`/api/homeclient/trainers/${trainerId}`);
  }

  // ==================== Programs ====================

  /**
   * Get all available programs
   * GET /api/homeclient/programs
   */
  getAllPrograms(): Observable<Program[]> {
    return this.apiService.get<Program[]>('/api/homeclient/programs');
  }

  /**
   * Get program by ID
   * GET /api/homeclient/programs/{id}
   */
  getProgramById(programId: number): Observable<Program> {
    return this.apiService.get<Program>(`/api/homeclient/programs/${programId}`);
  }

  /**
   * Get programs by trainer ID
   */
  getProgramsByTrainer(trainerId: string): Observable<Program[]> {
    return this.apiService.get<Program[]>(`/api/homeclient/programs/by-trainer/${trainerId}`);
  }
}

