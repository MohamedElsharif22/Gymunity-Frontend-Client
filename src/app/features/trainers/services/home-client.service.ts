import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  HomeClientSearchResponse,
  PackageClient,
  ProgramClient,
  TrainerClient,
} from '../../../core/models';

/**
 * HomeClientService
 * Provides access to public HomeClient API endpoints for:
 * - Unified search across packages, programs, and trainers
 * - Package discovery and details
 * - Trainer discovery and details
 * - Program discovery and details
 * - Content filtered by specific trainers
 *
 * All endpoints are public/unauthenticated access
 * Base path: /api/homeclient
 */
@Injectable({
  providedIn: 'root',
})
export class HomeClientService {
  private apiService = inject(ApiService);
  private baseUrl = '/api/homeclient';

  /**
   * Search across all content types (packages, programs, trainers)
   * @param term Search term to filter content
   * @returns Observable<HomeClientSearchResponse> containing matching packages, programs, and trainers
   */
  search(term: string): Observable<HomeClientSearchResponse> {
    return this.apiService.get<HomeClientSearchResponse>(
      `${this.baseUrl}/search?term=${encodeURIComponent(term)}`
    );
  }

  // ========== PACKAGES ENDPOINTS ==========

  /**
   * Get all packages available
   * @returns Observable<PackageClient[]> array of all packages
   */
  getAllPackages(): Observable<PackageClient[]> {
    return this.apiService.get<PackageClient[]>(`${this.baseUrl}/packages`);
  }

  /**
   * Get a specific package by ID
   * @param id Package ID
   * @returns Observable<PackageClient> the package details
   */
  getPackageById(id: string): Observable<PackageClient> {
    return this.apiService.get<PackageClient>(`${this.baseUrl}/packages/${id}`);
  }

  /**
   * Get packages for a specific trainer by trainer profile ID
   * @param trainerProfileId Trainer profile ID
   * @returns Observable<PackageClient[]> packages offered by this trainer
   */
  getPackagesByTrainerProfileId(
    trainerProfileId: string
  ): Observable<PackageClient[]> {
    return this.apiService.get<PackageClient[]>(
      `${this.baseUrl}/trainers/${trainerProfileId}/packages`
    );
  }

  /**
   * Get packages by trainer user ID
   * @param trainerUserId Trainer user ID
   * @returns Observable<PackageClient[]> packages by this trainer user
   */
  getPackagesByTrainerUserId(
    trainerUserId: string
  ): Observable<PackageClient[]> {
    return this.apiService.get<PackageClient[]>(
      `${this.baseUrl}/packages/byTrainerUser/${trainerUserId}`
    );
  }

  /**
   * Get packages by trainer profile ID (alternative endpoint)
   * @param trainerProfileId Trainer profile ID
   * @returns Observable<PackageClient[]> packages by this trainer profile
   */
  getPackagesByTrainerProfile(
    trainerProfileId: string
  ): Observable<PackageClient[]> {
    return this.apiService.get<PackageClient[]>(
      `${this.baseUrl}/packages/byTrainer/${trainerProfileId}`
    );
  }

  // ========== TRAINERS ENDPOINTS ==========

  /**
   * Get all trainers available
   * @returns Observable<TrainerClient[]> array of all trainers
   */
  getAllTrainers(): Observable<TrainerClient[]> {
    return this.apiService.get<TrainerClient[]>(`${this.baseUrl}/trainers`);
  }

  /**
   * Get a specific trainer by ID
   * @param id Trainer ID
   * @returns Observable<TrainerClient> the trainer details
   */
  getTrainerById(id: string): Observable<TrainerClient> {
    return this.apiService.get<TrainerClient>(`${this.baseUrl}/trainers/${id}`);
  }

  /**
   * Get packages offered by a specific trainer
   * @param trainerProfileId Trainer profile ID
   * @returns Observable<PackageClient[]> packages from this trainer
   */
  getTrainerPackages(trainerProfileId: string): Observable<PackageClient[]> {
    return this.apiService.get<PackageClient[]>(
      `${this.baseUrl}/trainers/${trainerProfileId}/packages`
    );
  }

  // ========== PROGRAMS ENDPOINTS ==========

  /**
   * Get all programs available
   * @returns Observable<ProgramClient[]> array of all programs
   */
  getAllPrograms(): Observable<ProgramClient[]> {
    return this.apiService.get<ProgramClient[]>(`${this.baseUrl}/programs`);
  }

  /**
   * Get a specific program by ID
   * @param id Program ID
   * @returns Observable<ProgramClient> the program details
   */
  getProgramById(id: string): Observable<ProgramClient> {
    return this.apiService.get<ProgramClient>(`${this.baseUrl}/programs/${id}`);
  }

  /**
   * Get programs by trainer profile ID
   * @param trainerProfileId Trainer profile ID
   * @returns Observable<ProgramClient[]> programs from this trainer
   */
  getProgramsByTrainerProfile(
    trainerProfileId: string
  ): Observable<ProgramClient[]> {
    return this.apiService.get<ProgramClient[]>(
      `${this.baseUrl}/programs/byTrainerProfile/${trainerProfileId}`
    );
  }

  /**
   * Get programs by trainer user ID
   * @param trainerId Trainer user ID
   * @returns Observable<ProgramClient[]> programs from this trainer
   */
  getProgramsByTrainerId(trainerId: string): Observable<ProgramClient[]> {
    return this.apiService.get<ProgramClient[]>(
      `${this.baseUrl}/programs/byTrainer/${trainerId}`
    );
  }
}

