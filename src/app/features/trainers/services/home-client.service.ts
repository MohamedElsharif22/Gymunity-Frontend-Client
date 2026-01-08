import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Package, Program, TrainerProfile, SearchResults } from '../../../core/models';
import { HttpParams } from '@angular/common/http';

/**
 * PackageClientResponse - Guest/home client view of a package
 * Maps to backend: public class PackageClientResponse
 */
export interface PackageClientResponse {
  id: number;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly?: number | null;
  isActive: boolean;
  thumbnailUrl?: string | null;
  trainerId: string; // user id
  createdAt: string; // DateTimeOffset
  isAnnual: boolean;
  promoCode?: string | null;
  programs?: any[]; // ProgramBriefResponse[]
}

/**
 * TrainerClientResponse - Guest/home client view of a trainer
 * Maps to backend: public class TrainerClientResponse
 * Note: Backend uses PascalCase, which gets converted to camelCase by JSON serialization
 */
export interface TrainerClientResponse {
  id: number;
  userId: string;
  userName: string;
  handle: string;
  bio: string;
  isVerified: boolean;
  coverImageUrl?: string | null;
  ratingAverage: number;
  totalClients: number;
  yearsExperience: number;
  totalReviews: number;
  startingPrice?: number | null;
  hasActiveSubscription: boolean;
}

/**
 * ProgramClientResponse - Guest/home client view of a program
 * Maps to backend: public class ProgramClientResponse
 */
export interface ProgramClientResponse {
  id: number;
  title: string;
  description: string;
  type: string; // ProgramType enum
  durationWeeks: number;
  price?: number | null;
  isPublic: boolean;
  maxClients?: number | null;
  thumbnailUrl?: string | null;
  createdAt: string; // DateTimeOffset
  updatedAt: string; // DateTimeOffset
  trainerId: string; // Backwards-compatible trainer user id
  trainerProfileId?: number | null; // New: reference to TrainerProfile
  trainerUserName?: string | null;
  trainerHandle?: string | null;
}

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

  /**
   * Transform PascalCase API response to camelCase
   * Backend returns PascalCase (UserId, UserName, IsVerified, etc.)
   * but frontend interfaces expect camelCase (userId, userName, isVerified, etc.)
   */
  private pascalToCamelCase(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      console.log('[HomeClientService] Transforming array with', obj.length, 'items');
      const transformed = obj.map(item => this.pascalToCamelCase(item));
      console.log('[HomeClientService] Transformed array:', transformed);
      return transformed;
    }
    
    if (typeof obj !== 'object') return obj;
    
    const camelCased: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Convert first letter to lowercase
        const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
        camelCased[camelKey] = this.pascalToCamelCase(obj[key]);
      }
    }
    return camelCased;
  }

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
   * GET /api/homeclient/packages
   * Returns: PackageClientResponse[]
   */
  getAllPackages(): Observable<PackageClientResponse[]> {
    return this.apiService.get<any>('/api/homeclient/packages').pipe(
      map(response => this.pascalToCamelCase(response))
    );
  }

  /**
   * Get package by ID
   * GET /api/homeclient/packages/{id}
   * Returns: PackageClientResponse
   */
  getPackageById(packageId: number): Observable<PackageClientResponse> {
    return this.apiService.get<any>(`/api/homeclient/packages/${packageId}`).pipe(
      map(response => this.pascalToCamelCase(response))
    );
  }

  /**
   * Get packages by trainer profile ID
   * GET /api/homeclient/trainers/{trainerProfileId}/packages
   * Returns: PackageClientResponse[]
   */
  getPackagesByTrainerProfileId(trainerProfileId: number): Observable<PackageClientResponse[]> {
    return this.apiService.get<any>(`/api/homeclient/trainers/${trainerProfileId}/packages`).pipe(
      map(response => this.pascalToCamelCase(response))
    );
  }

  /**
   * Get packages by trainer user ID (deprecated: use getPackagesByTrainerProfileId or getPackagesByTrainerUser instead)
   * GET /api/homeclient/packages/byTrainerUser/{trainerUserId}
   * Returns: PackageClientResponse[]
   */
  getPackagesByTrainerUser(trainerUserId: string): Observable<PackageClientResponse[]> {
    return this.apiService.get<any>(`/api/homeclient/packages/byTrainerUser/${trainerUserId}`).pipe(
      map(response => this.pascalToCamelCase(response))
    );
  }

  /**
   * Get packages by trainer (legacy endpoint for backwards compatibility)
   * GET /api/homeclient/packages/byTrainer/{trainerProfileId}
   * Returns: PackageClientResponse[]
   */
  getPackagesByTrainer(trainerId: string): Observable<PackageClientResponse[]> {
    return this.apiService.get<any>(`/api/homeclient/packages/byTrainer/${trainerId}`).pipe(
      map(response => this.pascalToCamelCase(response))
    );
  }

  // ==================== Trainers ====================

  /**
   * Get all trainers
   * GET /api/homeclient/trainers
   * Returns: TrainerClientResponse[]
   */
  getAllTrainers(): Observable<TrainerClientResponse[]> {
    console.log('[HomeClientService] Calling getAllTrainers()');
    return this.apiService.get<any>('/api/homeclient/trainers').pipe(
      tap(rawResponse => {
        console.log('[HomeClientService] ⚡ Raw trainers response received:', rawResponse);
        console.log('[HomeClientService] Response type:', typeof rawResponse);
        console.log('[HomeClientService] Is array?', Array.isArray(rawResponse));
        if (Array.isArray(rawResponse)) {
          console.log('[HomeClientService] Response length:', rawResponse.length);
          if (rawResponse.length > 0) {
            console.log('[HomeClientService] First trainer object keys:', Object.keys(rawResponse[0]));
            console.log('[HomeClientService] First trainer raw:', rawResponse[0]);
          }
        }
      }),
      map(response => {
        const transformed = this.pascalToCamelCase(response);
        console.log('[HomeClientService] ✅ Transformed trainers response:', transformed);
        if (Array.isArray(transformed) && transformed.length > 0) {
          console.log('[HomeClientService] Transformed first trainer:', transformed[0]);
        }
        return transformed;
      })
    );
  }

  /**
   * Get trainer by profile ID
   * GET /api/homeclient/trainers/{id}
   * Returns: TrainerClientResponse
   */
  getTrainerById(trainerId: number): Observable<TrainerClientResponse> {
    return this.apiService.get<any>(`/api/homeclient/trainers/${trainerId}`).pipe(
      map(response => this.pascalToCamelCase(response))
    );
  }

  // ==================== Programs ====================

  /**
   * Get all available programs (guest view)
   * GET /api/homeclient/programs
   * Returns: ProgramClientResponse[]
   */
  getAllPrograms(): Observable<ProgramClientResponse[]> {
    return this.apiService.get<any>('/api/homeclient/programs').pipe(
      map(response => this.pascalToCamelCase(response))
    );
  }

  /**
   * Get program by ID (guest view)
   * GET /api/homeclient/programs/{id}
   * Returns: ProgramClientResponse
   */
  getProgramById(programId: number): Observable<ProgramClientResponse> {
    return this.apiService.get<any>(`/api/homeclient/programs/${programId}`).pipe(
      map(response => this.pascalToCamelCase(response))
    );
  }

  /**
   * Get programs by trainer user ID
   * GET /api/homeclient/programs/byTrainer/{trainerId}
   * Parameter trainerId is the user ID
   * Returns: ProgramClientResponse[]
   */
  getProgramsByTrainer(trainerId: string): Observable<ProgramClientResponse[]> {
    return this.apiService.get<any>(`/api/homeclient/programs/byTrainer/${trainerId}`).pipe(
      map(response => this.pascalToCamelCase(response))
    );
  }

  /**
   * Get programs by trainer user ID (alternative endpoint)
   * GET /api/homeclient/programs/byTrainerUser/{trainerUserId}
   * Returns: ProgramClientResponse[]
   */
  getProgramsByTrainerUser(trainerUserId: string): Observable<ProgramClientResponse[]> {
    return this.apiService.get<any>(`/api/homeclient/programs/byTrainerUser/${trainerUserId}`).pipe(
      map(response => this.pascalToCamelCase(response))
    );
  }

  /**
   * Get programs by trainer profile ID
   * GET /api/homeclient/programs/byTrainerProfile/{trainerProfileId}
   * Returns: ProgramClientResponse[]
   */
  getProgramsByTrainerProfile(trainerProfileId: number): Observable<ProgramClientResponse[]> {
    return this.apiService.get<any>(`/api/homeclient/programs/byTrainerProfile/${trainerProfileId}`).pipe(
      map(response => this.pascalToCamelCase(response))
    );
  }
}

